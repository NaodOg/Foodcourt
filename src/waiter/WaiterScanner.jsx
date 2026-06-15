import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useParams } from 'react-router-dom';

function parseOrderQR(text) {
  const sections = text.split('---').map(s => s.trim()).filter(Boolean);
  if (sections.length === 0) return null;

  const orders = sections.map(section => {
    const lines = section.split('\n').filter(Boolean);

    let houseSlug = null;
    let startIndex = 0;

    if (lines[0]?.trim().startsWith('HOUSE:')) {
      houseSlug = lines[0].replace('HOUSE:', '').trim();
      startIndex = 1;
    }

    const items = [];
    let i = startIndex;
    for (; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('Subtotal')) break;
      const match = line.match(/^(\d+)x\s+(.+)/);
      if (match) {
        items.push({ quantity: parseInt(match[1]), name: match[2] });
      } else if (!line.startsWith('Tax') && !line.startsWith('Total') && line.length > 0) {
        items.push({ quantity: 1, name: line });
      }
    }

    const summary = { subtotal: '', tax: '', total: '' };
    for (; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('Subtotal')) summary.subtotal = line.replace('Subtotal: ', '');
      if (line.startsWith('Tax')) summary.tax = line.replace(/Tax \(.*?\): /, '');
      if (line.startsWith('Total')) summary.total = line.replace('Total: ', '');
    }

    return { items, ...summary, houseSlug };
  }).filter(o => o.items.length > 0);

  if (orders.length === 0) return null;
  return orders.length === 1 ? orders[0] : orders;
}

export default function WaiterScanner() {
  const { houseSlug: routeHouseSlug } = useParams();
  const [mode, setMode] = useState('idle');
  const [orderData, setOrderData] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [scannedHouse, setScannedHouse] = useState(null);
  const [houseFilter, setHouseFilter] = useState(routeHouseSlug || 'all');
  const scannerRef = useRef(null);

  const saveOrder = useMutation(api.scannedOrders.saveOrder);
  const discardOrder = useMutation(api.scannedOrders.discardOrder);
  const todayOrders = useQuery(api.scannedOrders.getTodayOrders, {});
  const allHouses = useQuery(api.houses.getAllHouses);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* scanner already stopped */ }
      try { await scannerRef.current.clear(); } catch { /* scanner already cleared */ }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  useEffect(() => {
    if (mode !== 'scanning') return;
    if (scannerRef.current) return;

    let cancelled = false;

    (async () => {
      setCameraError('');
      setError('');
      try {
        scannerRef.current = new Html5Qrcode('qr-scanner');
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 30,
            qrbox: (vw, vh) => ({ width: Math.floor(vw * 0.85), height: Math.floor(vh * 0.85) }),
            aspectRatio: 1,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          },
          async (decodedText) => {
            const parsed = parseOrderQR(decodedText);
            const orders = Array.isArray(parsed) ? parsed : [parsed];
            const validOrders = orders.filter(o => o && o.items?.length > 0);
            if (validOrders.length > 0) {
              try { await scannerRef.current?.stop(); } catch { /* scanner stopped */ }
              scannerRef.current = null;

              setOrderData(validOrders.length === 1 ? validOrders[0] : validOrders);
              setScanTime(new Date().toLocaleTimeString());
              setMode('scanned');

              // Save one order per house
              validOrders.forEach(o => {
                const matchedHouse = allHouses?.find(h => h.slug === o.houseSlug);
                if (matchedHouse) {
                  const { houseSlug, ...cleanOrderData } = o;
                  saveOrder({ houseId: matchedHouse._id, orderData: cleanOrderData });
                }
              });

              // Set first house for display
              const firstHouse = allHouses?.find(h => h.slug === validOrders[0].houseSlug);
              setScannedHouse(firstHouse || null);
            } else {
              navigator.vibrate?.(100);
              setError('Invalid order QR code');
              setTimeout(() => setError(''), 1500);
            }
          },
          () => {}
        );
      } catch (err) {
        if (!cancelled) {
          setCameraError(err.message || 'Camera access denied or unavailable');
          setMode('idle');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [mode, saveOrder, allHouses]);

  const startScanning = useCallback(() => {
    setCameraError('');
    setError('');
    setMode('scanning');
  }, []);

  const handleScanAgain = useCallback(() => {
    setOrderData(null);
    setScanTime(null);
    setScannedHouse(null);
    setError('');
    setMode('scanning');
  }, []);

  const handleDone = useCallback(async () => {
    await stopScanner();
    setOrderData(null);
    setScanTime(null);
    setScannedHouse(null);
    setMode('idle');
  }, [stopScanner]);

  const handleDiscard = useCallback(async (id) => {
    await discardOrder({ id });
  }, [discardOrder]);

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const filteredOrders = todayOrders?.filter(o => {
    if (houseFilter === 'all') return true;
    const house = allHouses?.find(h => h._id === o.houseId);
    return house?.slug === houseFilter;
  });

  const getHouseForOrder = (order) => {
    return allHouses?.find(h => h._id === order.houseId);
  };

  if (mode === 'scanned' && orderData) {
    return (
      <div className="min-h-[100dvh] bg-creamy flex flex-col">
        <div className="flex-1 flex flex-col items-center px-4 sm:px-8 py-10 animate-fade-in">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-pop-in">
                <span className="material-symbols-outlined text-green-600 text-4xl">check</span>
              </div>
              <h1 className="font-headline-md text-3xl text-on-background mb-1">Order Received</h1>
              {scannedHouse && (
                <div className="flex items-center gap-2 mt-1 mb-1 bg-white rounded-full px-4 py-1.5 shadow-sm border border-surface-variant">
                  <img src={scannedHouse.logo} alt={scannedHouse.name} className="w-5 h-5 rounded object-cover" />
                  <span className="font-label-bold text-sm text-secondary">{scannedHouse.name}</span>
                </div>
              )}
              <p className="text-secondary font-body-md">Scanned at {scanTime}</p>
            </div>

            {Array.isArray(orderData) ? (
              <div className="w-full space-y-4">
                {orderData.map((order, oi) => {
                  const h = allHouses?.find(hh => hh.slug === order.houseSlug);
                  return (
                    <div key={oi} className="bg-white rounded-2xl shadow-lg border border-surface-variant overflow-hidden">
                      <div className="px-5 sm:px-7 py-3 bg-surface-container-low border-b border-surface-variant flex items-center gap-2">
                        {h && <img src={h.logo} alt={h.name} className="w-5 h-5 rounded object-cover" />}
                        <span className="font-label-bold text-sm text-secondary uppercase tracking-wide">{h?.name || 'Order'}</span>
                        <span className="ml-auto text-xs text-secondary">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </div>
                      <ul className="divide-y divide-surface-variant">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-4 px-5 sm:px-7 py-4">
                            <span className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-label-bold flex items-center justify-center shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="font-body-md text-on-background text-lg">{item.name}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="border-t border-surface-variant px-5 sm:px-7 py-5 space-y-2">
                        {order.subtotal && (
                          <div className="flex justify-between text-secondary">
                            <span>Subtotal</span>
                            <span>{order.subtotal}</span>
                          </div>
                        )}
                        {order.tax && (
                          <div className="flex justify-between text-secondary">
                            <span>Tax</span>
                            <span>{order.tax}</span>
                          </div>
                        )}
                        {order.total && (
                          <div className="flex justify-between text-lg font-label-bold text-on-background pt-3 border-t border-surface-variant">
                            <span>Total</span>
                            <span className="text-brand-red">{order.total}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-surface-variant overflow-hidden">
                <div className="px-5 sm:px-7 py-4 bg-surface-container-low border-b border-surface-variant flex items-center justify-between">
                  <span className="font-label-bold text-sm text-secondary uppercase tracking-wide">Items</span>
                  <span className="text-xs text-secondary">{orderData.items.length} item{orderData.items.length !== 1 ? 's' : ''}</span>
                </div>
                <ul className="divide-y divide-surface-variant">
                  {orderData.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 px-5 sm:px-7 py-4">
                      <span className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-label-bold flex items-center justify-center shrink-0">
                        {item.quantity}x
                      </span>
                      <span className="font-body-md text-on-background text-lg">{item.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-surface-variant px-5 sm:px-7 py-5 space-y-2">
                  {orderData.subtotal && (
                    <div className="flex justify-between text-secondary">
                      <span>Subtotal</span>
                      <span>{orderData.subtotal}</span>
                    </div>
                  )}
                  {orderData.tax && (
                    <div className="flex justify-between text-secondary">
                      <span>Tax</span>
                      <span>{orderData.tax}</span>
                    </div>
                  )}
                  {orderData.total && (
                    <div className="flex justify-between text-lg font-label-bold text-on-background pt-3 border-t border-surface-variant">
                      <span>Total</span>
                      <span className="text-brand-red">{orderData.total}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-10">
              <button
                onClick={handleScanAgain}
                className="flex-1 bg-brand-red text-white font-label-bold py-4 rounded-xl hover:bg-brand-red/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                Scan Next
              </button>
              <button
                onClick={handleDone}
                className="flex-1 bg-white text-on-background font-label-bold py-4 rounded-xl border border-surface-variant hover:bg-surface-container-low active:scale-[0.98] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'scanning') {
    return (
      <div className="min-h-[100dvh] bg-black flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-[100vw]">
            <div className="relative w-full aspect-square overflow-hidden shadow-2xl shadow-black/50">
              <div id="qr-scanner" className="w-full h-full" />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-[6px] border-l-[6px] border-brand-red rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-20 h-20 border-t-[6px] border-r-[6px] border-brand-red rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-[6px] border-l-[6px] border-brand-red rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-[6px] border-r-[6px] border-brand-red rounded-br-3xl" />
                <div className="absolute left-8 right-8 h-[4px] bg-gradient-to-r from-transparent via-brand-red to-transparent animate-scan rounded-full" />
              </div>
            </div>
          </div>

          <p className="text-white/70 text-base mt-8 font-body-md text-center">
            Point camera at the customer's QR code
          </p>

          {error && (
            <div className="mt-4 px-5 py-3 bg-red-500/20 rounded-xl flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
              <span className="text-red-300 text-sm font-label-bold">{error}</span>
            </div>
          )}

          <button
            onClick={handleDone}
            className="mt-8 px-10 py-3.5 rounded-xl bg-white/10 text-white/80 font-label-bold hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-sm"
          >
            Cancel
          </button>
        </div>

        <div className="px-6 py-4 flex items-center justify-center gap-2">
          <img src="/logos/flint-court.jpg" alt="" className="w-5 h-5 rounded object-cover opacity-40" />
          <span className="font-headline-md text-sm text-white/40 tracking-wide uppercase">Flint Food Court · Waiter</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-creamy flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 sm:px-8 py-8">
        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          <img src="/logos/flint-court.jpg" alt="Flint Food Court" className="w-40 h-40 object-contain mb-6" />

          <h1 className="font-headline-md text-4xl sm:text-5xl lg:text-6xl text-on-background mb-3">Waiter Scanner</h1>
          <p className="text-secondary text-lg sm:text-xl font-body-md mb-10">
            Scan customer order QR codes to view and process orders
          </p>

          {cameraError && (
            <div className="w-full mb-6 px-5 py-4 bg-error-container rounded-xl flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">warning</span>
              <div>
                <p className="text-error font-label-bold">Camera unavailable</p>
                <p className="text-error/80 text-sm mt-0.5">{cameraError}</p>
              </div>
            </div>
          )}

          <button
            onClick={startScanning}
            className="w-full bg-brand-red text-white font-label-bold py-5 rounded-xl hover:bg-brand-red/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xl shadow-lg shadow-brand-red/20"
          >
            <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
            Start Scanning
          </button>
        </div>

        {/* Today's Orders History */}
        <div className="w-full max-w-2xl mt-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-on-background text-[22px]">history</span>
            <h2 className="font-label-bold text-xl text-on-background">Today's Orders</h2>
            {todayOrders && (
              <span className="text-sm text-secondary font-body-md ml-auto">
                {filteredOrders?.length || 0} order{(filteredOrders?.length || 0) !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* House filter tabs */}
          {allHouses && allHouses.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setHouseFilter('all')}
                className={`px-4 py-1.5 rounded-full font-label-bold text-sm whitespace-nowrap transition-colors ${
                  houseFilter === 'all'
                    ? 'bg-brand-red text-white'
                    : 'bg-surface-variant text-secondary hover:bg-surface-dim'
                }`}
              >
                All
              </button>
              {allHouses.map(house => (
                <button
                  key={house._id}
                  onClick={() => setHouseFilter(house.slug)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label-bold text-sm whitespace-nowrap transition-colors ${
                    houseFilter === house.slug
                      ? 'bg-brand-red text-white'
                      : 'bg-surface-variant text-secondary hover:bg-surface-dim'
                  }`}
                >
                  <img src={house.logo} alt="" className="w-4 h-4 rounded object-cover" />
                  {house.name}
                </button>
              ))}
            </div>
          )}

          {!todayOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredOrders?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-variant px-6 py-10 text-center">
              <span className="material-symbols-outlined text-secondary/40 text-5xl mb-3">receipt_long</span>
              <p className="text-secondary font-body-md">No orders scanned today yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders?.map((order) => {
                const isExpanded = expandedOrder === order._id;
                const orderHouse = getHouseForOrder(order);
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-surface-variant overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red font-label-bold flex items-center justify-center shrink-0">
                        {order.orderData.items.length}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-label-bold text-on-background truncate">
                            {order.orderData.items.length} item{order.orderData.items.length !== 1 ? 's' : ''}
                          </span>
                          {orderHouse && (
                            <img src={orderHouse.logo} alt={orderHouse.name} className="w-4 h-4 rounded object-cover shrink-0" title={orderHouse.name} />
                          )}
                        </div>
                        <div className="text-xs text-secondary font-body-md mt-0.5">
                          {formatTime(order._creationTime)}
                        </div>
                      </div>
                      {order.orderData.total && (
                        <span className="font-label-bold text-brand-red">{order.orderData.total}</span>
                      )}
                      <span className="material-symbols-outlined text-secondary text-[20px] transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-surface-variant animate-fade-in">
                        {orderHouse && (
                          <div className="flex items-center gap-2 px-5 py-2 bg-surface-container-low border-b border-surface-variant">
                            <img src={orderHouse.logo} alt={orderHouse.name} className="w-4 h-4 rounded object-cover" />
                            <span className="text-xs font-label-bold text-secondary">{orderHouse.name}</span>
                          </div>
                        )}
                        <ul className="divide-y divide-surface-variant">
                          {order.orderData.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 px-5 py-3">
                              <span className="w-8 h-8 rounded-lg bg-brand-red/10 text-brand-red text-xs font-label-bold flex items-center justify-center shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="font-body-md text-on-background">{item.name}</span>
                            </li>
                          ))}
                        </ul>

                        {(order.orderData.subtotal || order.orderData.tax || order.orderData.total) && (
                          <div className="border-t border-surface-variant px-5 py-3 space-y-1 text-sm">
                            {order.orderData.subtotal && (
                              <div className="flex justify-between text-secondary">
                                <span>Subtotal</span>
                                <span>{order.orderData.subtotal}</span>
                              </div>
                            )}
                            {order.orderData.tax && (
                              <div className="flex justify-between text-secondary">
                                <span>Tax</span>
                                <span>{order.orderData.tax}</span>
                              </div>
                            )}
                            {order.orderData.total && (
                              <div className="flex justify-between font-label-bold text-on-background pt-2 border-t border-surface-variant mt-2">
                                <span>Total</span>
                                <span className="text-brand-red">{order.orderData.total}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-variant flex justify-end">
                          <button
                            onClick={() => handleDiscard(order._id)}
                            className="inline-flex items-center gap-1.5 text-sm font-label-bold text-error hover:text-error/80 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex items-center justify-center gap-2 border-t border-surface-variant">
        <img src="/logos/flint-court.jpg" alt="" className="w-5 h-5 rounded object-cover" />
        <span className="font-headline-md text-sm text-secondary tracking-wide uppercase">Flint Food Court</span>
      </div>
    </div>
  );
}
