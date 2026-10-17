import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Vehicle,
  Driver,
  Dispatch,
  Delivery,
  FuelEntry,
  Expense,
  OperationalNotification,
  DashboardMetrics,
  DispatchStatus,
} from '../types';
import {
  initialVehicles,
  initialDrivers,
  initialDispatches,
  initialDeliveries,
  initialFuelEntries,
  initialExpenses,
  initialNotifications,
  defaultDashboardMetrics,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface TMSContextType {
  vehicles: Vehicle[];
  drivers: Driver[];
  dispatches: Dispatch[];
  deliveries: Delivery[];
  fuelEntries: FuelEntry[];
  expenses: Expense[];
  notifications: OperationalNotification[];
  metrics: DashboardMetrics;
  activeHub: string;
  setActiveHub: (hub: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // CRUD Operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (id: string) => void;
  assignDriverToVehicle: (driverId: string, vehicleId?: string) => void;

  addDispatch: (dispatch: Omit<Dispatch, 'id' | 'createdAt'>) => void;
  updateDispatch: (dispatch: Dispatch) => void;
  deleteDispatch: (id: string) => void;
  advanceDispatchStage: (dispatchId: string) => void;

  updateDelivery: (delivery: Delivery) => void;
  addDeliveryNote: (deliveryId: string, note: string) => void;
  sendTestNotification: (deliveryId: string, channelName?: string) => void;

  addFuelEntry: (entry: Omit<FuelEntry, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Sales presentation live simulation triggers
  simulateTrafficDelay: () => void;
  simulateCompletedDelivery: () => void;
  simulateFuelRefuel: () => void;
  resetAllData: () => void;
}

const TMSContext = createContext<TMSContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'transpol_tms_v1_';

export const TMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state with localStorage support
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}vehicles`);
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}drivers`);
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dispatches`);
    return saved ? JSON.parse(saved) : initialDispatches;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}deliveries`);
    return saved ? JSON.parse(saved) : initialDeliveries;
  });

  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fuel`);
    return saved ? JSON.parse(saved) : initialFuelEntries;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [notifications, setNotifications] = useState<OperationalNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [activeHub, setActiveHub] = useState<string>('warsaw');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}drivers`, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}dispatches`, JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}deliveries`, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}fuel`, JSON.stringify(fuelEntries));
  }, [fuelEntries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Derived metrics dynamically kept consistent
  const metrics = useMemo<DashboardMetrics>(() => {
    const activeTrucks = vehicles.filter((v) => v.status === 'in_transit' || v.status === 'delayed').length;
    const availableTrucks = vehicles.filter((v) => v.status === 'available').length;
    const inProgress = dispatches.filter((d) => d.status === 'in_transit' || d.status === 'delayed').length;
    const atRisk = dispatches.filter((d) => d.status === 'delayed').length;

    // Sum fuel entries for current month
    const fuelCostSum = fuelEntries.reduce((sum, item) => sum + item.costPln, 0);
    // Sum all operating expenses
    const operatingCostSum = expenses.reduce((sum, item) => sum + item.amountPln, 0);

    const deliveredCount = dispatches.filter((d) => d.status === 'delivered').length;
    const totalDispatchesFinished = deliveredCount + atRisk;
    const onTimeRate = totalDispatchesFinished > 0
      ? Math.round((deliveredCount / totalDispatchesFinished) * 1000) / 10
      : 96.4;

    const totalRevenue = dispatches.reduce((sum, d) => sum + (d.ratePln || 0), 0) + 180000;

    return {
      activeTrucks: activeTrucks || defaultDashboardMetrics.activeTrucks,
      availableTrucks: availableTrucks || defaultDashboardMetrics.availableTrucks,
      deliveriesInProgress: inProgress || defaultDashboardMetrics.deliveriesInProgress,
      deliveriesAtRisk: atRisk || defaultDashboardMetrics.deliveriesAtRisk,
      monthlyFuelExpensesPln: Math.round(fuelCostSum > 0 ? fuelCostSum + 12500 : defaultDashboardMetrics.monthlyFuelExpensesPln),
      estimatedOperatingCostsPln: Math.round(operatingCostSum > 0 ? operatingCostSum : defaultDashboardMetrics.estimatedOperatingCostsPln),
      totalFleetCount: vehicles.length,
      onTimeDeliveryRatePercent: onTimeRate,
      averageConsumptionL100Km: 28.1,
      revenueThisMonthPln: totalRevenue,
    };
  }, [vehicles, dispatches, fuelEntries, expenses]);

  // Vehicle operations
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newId = `veh-${Date.now()}`;
    const newVehicle: Vehicle = { ...vehicleData, id: newId };
    setVehicles((prev) => [newVehicle, ...prev]);
    showToast(`Pojazd ${newVehicle.registration} został dodany do floty.`);
  };

  const updateVehicle = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    showToast(`Zaktualizowano dane pojazdu ${updated.registration}.`);
  };

  const deleteVehicle = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    // also detach from driver
    setDrivers((prev) =>
      prev.map((d) => (d.assignedVehicleId === id ? { ...d, assignedVehicleId: undefined } : d))
    );
    showToast(`Pojazd ${target?.registration || id} został usunięty.`, 'info');
  };

  // Driver operations
  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newId = `drv-${Date.now()}`;
    const newDriver: Driver = { ...driverData, id: newId };
    setDrivers((prev) => [newDriver, ...prev]);
    showToast(`Kierowca ${newDriver.fullName} został dodany do systemu.`);
  };

  const updateDriver = (updated: Driver) => {
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Zaktualizowano profil kierowcy ${updated.fullName}.`);
  };

  const deleteDriver = (id: string) => {
    const target = drivers.find((d) => d.id === id);
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    // detach from vehicle
    setVehicles((prev) =>
      prev.map((v) => (v.assignedDriverId === id ? { ...v, assignedDriverId: undefined } : v))
    );
    showToast(`Kierowca ${target?.fullName || id} został usunięty.`, 'info');
  };

  const assignDriverToVehicle = (driverId: string, vehicleId?: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    const vehicle = vehicleId ? vehicles.find((v) => v.id === vehicleId) : undefined;

    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          return { ...d, assignedVehicleId: vehicleId };
        }
        // If another driver had this vehicle, detach them
        if (vehicleId && d.assignedVehicleId === vehicleId) {
          return { ...d, assignedVehicleId: undefined };
        }
        return d;
      })
    );

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, assignedDriverId: driverId };
        }
        if (v.assignedDriverId === driverId && v.id !== vehicleId) {
          return { ...v, assignedDriverId: undefined };
        }
        return v;
      })
    );

    if (vehicle && driver) {
      showToast(`Przypisano kierowcę ${driver.fullName} do pojazdu ${vehicle.registration}.`);
    } else if (driver) {
      showToast(`Odłączono kierowcę ${driver.fullName} od pojazdu.`, 'info');
    }
  };

  // Dispatch operations
  const addDispatch = (dispatchData: Omit<Dispatch, 'id' | 'createdAt'>) => {
    const newId = `dsp-${Date.now()}`;
    const newDispatch: Dispatch = {
      ...dispatchData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setDispatches((prev) => [newDispatch, ...prev]);

    // Create a corresponding delivery record if assigned or in_transit
    const newDeliveryId = `del-${Date.now()}`;
    const newDelivery: Delivery = {
      id: newDeliveryId,
      dispatchId: newId,
      trackingNumber: `TRK-PL-${Math.floor(10000 + Math.random() * 90000)}`,
      currentLocationCity: `${newDispatch.originCity} (Magazyn Załadunku)`,
      progressPercent: newDispatch.status === 'in_transit' ? 25 : 0,
      estimatedDeliveryTime: newDispatch.plannedDeliveryTime,
      delayMinutes: 0,
      speedKmh: newDispatch.status === 'in_transit' ? 82 : 0,
      distanceRemainingKm: newDispatch.routeDistanceKm,
      milestones: [
        { step: 1, name: 'Zlecenie przyjęte w systemie', time: newDispatch.plannedPickupTime, completed: true },
        { step: 2, name: `Załadunek ${newDispatch.originCity}`, completed: newDispatch.status === 'in_transit' },
        { step: 3, name: `W trasie do ${newDispatch.destinationCity}`, completed: false },
        { step: 4, name: `Rozładunek ${newDispatch.destinationCity}`, completed: false },
        { step: 5, name: 'Podpisany list przewozowy CMR', completed: false },
      ],
      customerNotificationPhone: '+48 601 999 888',
      customerNotificationEmail: 'klient@odbiorca.pl',
      driverNotes: ['Zlecenie wprowadzone do systemu TMS.'],
    };
    setDeliveries((prev) => [newDelivery, ...prev]);

    showToast(`Utworzono zlecenie ${newDispatch.dispatchNumber}: ${newDispatch.originCity} → ${newDispatch.destinationCity}`);
  };

  const updateDispatch = (updated: Dispatch) => {
    setDispatches((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Zaktualizowano zlecenie ${updated.dispatchNumber}.`);
  };

  const deleteDispatch = (id: string) => {
    const target = dispatches.find((d) => d.id === id);
    setDispatches((prev) => prev.filter((d) => d.id !== id));
    setDeliveries((prev) => prev.filter((del) => del.dispatchId !== id));
    showToast(`Usunięto zlecenie ${target?.dispatchNumber || id}.`, 'info');
  };

  const advanceDispatchStage = (dispatchId: string) => {
    const stages: DispatchStatus[] = ['planned', 'assigned', 'in_transit', 'delivered'];
    const currentDispatch = dispatches.find((d) => d.id === dispatchId);
    if (!currentDispatch) return;

    let nextStatus: DispatchStatus = 'delivered';
    if (currentDispatch.status === 'delayed') {
      nextStatus = 'delivered';
    } else {
      const idx = stages.indexOf(currentDispatch.status);
      if (idx !== -1 && idx < stages.length - 1) {
        nextStatus = stages[idx + 1];
      }
    }

    setDispatches((prev) =>
      prev.map((d) => {
        if (d.id === dispatchId) {
          return {
            ...d,
            status: nextStatus,
            actualPickupTime: nextStatus === 'in_transit' ? '08:30' : d.actualPickupTime,
            actualDeliveryTime: nextStatus === 'delivered' ? '14:20' : d.actualDeliveryTime,
          };
        }
        return d;
      })
    );

    // Update corresponding delivery milestones
    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.dispatchId === dispatchId) {
          const isDelivered = nextStatus === 'delivered';
          const isInTransit = nextStatus === 'in_transit';
          return {
            ...del,
            progressPercent: isDelivered ? 100 : isInTransit ? 75 : del.progressPercent,
            speedKmh: isDelivered ? 0 : del.speedKmh,
            distanceRemainingKm: isDelivered ? 0 : Math.round(del.distanceRemainingKm / 2),
            milestones: del.milestones.map((m) => {
              if (isDelivered) return { ...m, completed: true, current: false };
              if (isInTransit && m.step <= 3) return { ...m, completed: true, current: m.step === 3 };
              return m;
            }),
          };
        }
        return del;
      })
    );

    // Add notification
    const newNotif: OperationalNotification = {
      id: `notif-${Date.now()}`,
      title: `Zmiana statusu: ${currentDispatch.dispatchNumber}`,
      message: `Zlecenie ${currentDispatch.originCity} → ${currentDispatch.destinationCity} ma status: ${nextStatus.toUpperCase()}.`,
      timestamp: 'Przed chwilą',
      read: false,
      type: nextStatus === 'delivered' ? 'success' : 'info',
      targetTab: 'dispatch',
      entityId: dispatchId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Zlecenie ${currentDispatch.dispatchNumber} przeszło do etapu: ${nextStatus}.`);
  };

  // Delivery operations
  const updateDelivery = (updated: Delivery) => {
    setDeliveries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    showToast(`Zaktualizowano dane dostawy ${updated.trackingNumber}.`);
  };

  const addDeliveryNote = (deliveryId: string, noteText: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          return {
            ...d,
            driverNotes: [noteText, ...(d.driverNotes || [])],
          };
        }
        return d;
      })
    );
    showToast('Dodano notatkę dyspozytorską.');
  };

  const sendTestNotification = (deliveryId: string, channelName = 'SMS / WhatsApp') => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return;

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === deliveryId) {
          return {
            ...d,
            lastNotificationSentAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );

    showToast(`Wysłano powiadomienie ${channelName} do odbiorcy (${delivery.customerNotificationPhone})`);
  };

  // Cost operations
  const addFuelEntry = (entryData: Omit<FuelEntry, 'id'>) => {
    const newId = `fuel-${Date.now()}`;
    const newEntry: FuelEntry = { ...entryData, id: newId };
    setFuelEntries((prev) => [newEntry, ...prev]);

    // Also add an expense under category 'fuel'
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: newEntry.date,
      category: 'fuel',
      vehicleId: newEntry.vehicleId,
      amountPln: newEntry.costPln,
      description: `Tankowanie ${newEntry.liters}L na stacji ${newEntry.gasStation}`,
      invoiceNumber: `KW/${Date.now().toString().slice(-6)}`,
      vendorName: newEntry.gasStation,
    };
    setExpenses((prev) => [newExpense, ...prev]);

    showToast(`Zarejestrowano tankowanie ${newEntry.liters} litrów (${newEntry.costPln.toFixed(2)} zł).`);
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newId = `exp-${Date.now()}`;
    const newExpense: Expense = { ...expenseData, id: newId };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Zaksięgowano koszt operacyjny: ${newExpense.amountPln.toFixed(2)} zł.`);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Oznaczono wszystkie powiadomienia jako przeczytane.', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Wyczyszczono listę powiadomień.', 'info');
  };

  // Operational event simulation triggers
  const simulateTrafficDelay = () => {
    // Pick an in-transit dispatch to delay
    const inTransit = dispatches.find((d) => d.status === 'in_transit');
    if (!inTransit) {
      showToast('Brak aktywnego zlecenia w trasie do opóźnienia.', 'warning');
      return;
    }

    setDispatches((prev) =>
      prev.map((d) => (d.id === inTransit.id ? { ...d, status: 'delayed', priority: 'urgent' } : d))
    );

    setDeliveries((prev) =>
      prev.map((del) => {
        if (del.dispatchId === inTransit.id) {
          return {
            ...del,
            delayMinutes: 65,
            delayReason: 'Nagły zator po wypadku na A2 przed węzłem Łódź Północ (+65 min opóźnienia)',
            estimatedDeliveryTime: '16:15',
            speedKmh: 14,
          };
        }
        return del;
      })
    );

    const delayNotif: OperationalNotification = {
      id: `notif-${Date.now()}`,
      title: `ALERT OPÓŹNIENIA: Zlecenie ${inTransit.dispatchNumber}`,
      message: `Zator drogowy na A2. Nowy przewidywany czas dostawy: 16:15 (+65 min). Powiadomiono klienta.`,
      timestamp: 'Przed chwilą',
      read: false,
      type: 'danger',
      targetTab: 'deliveries',
      entityId: inTransit.id,
    };
    setNotifications((prev) => [delayNotif, ...prev]);

    showToast(`Zarejestrowano opóźnienie dla zlecenia ${inTransit.dispatchNumber} na trasie.`, 'warning');
  };

  const simulateCompletedDelivery = () => {
    const target = dispatches.find((d) => d.status === 'in_transit' || d.status === 'delayed');
    if (!target) {
      showToast('Wszystkie zlecenia są już dostarczone.', 'info');
      return;
    }
    advanceDispatchStage(target.id);
  };

  const simulateFuelRefuel = () => {
    const randomLiters = Math.floor(380 + Math.random() * 120);
    const price = 6.58;
    const cost = Math.round(randomLiters * price * 100) / 100;
    addFuelEntry({
      vehicleId: 'veh-01',
      driverId: 'drv-01',
      date: new Date().toISOString().split('T')[0],
      liters: randomLiters,
      costPln: cost,
      pricePerLiterPln: price,
      odometerKm: 143120,
      gasStation: 'Orlen MOP Otłoczyn Zachód A1',
      city: 'Toruń (A1)',
      calculatedConsumptionL100Km: 27.8,
      paymentMethod: 'Karta Orlen Flota',
    });
  };

  const resetAllData = () => {
    setVehicles(initialVehicles);
    setDrivers(initialDrivers);
    setDispatches(initialDispatches);
    setDeliveries(initialDeliveries);
    setFuelEntries(initialFuelEntries);
    setExpenses(initialExpenses);
    setNotifications(initialNotifications);

    localStorage.removeItem(`${STORAGE_KEY_PREFIX}vehicles`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}drivers`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}dispatches`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}deliveries`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}fuel`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}expenses`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}notifications`);

    showToast('Przywrócono domyślne dane operacyjne floty.', 'info');
  };

  return (
    <TMSContext.Provider
      value={{
        vehicles,
        drivers,
        dispatches,
        deliveries,
        fuelEntries,
        expenses,
        notifications,
        metrics,
        activeHub,
        setActiveHub,
        globalSearchQuery,
        setGlobalSearchQuery,

        toasts,
        showToast,
        removeToast,

        addVehicle,
        updateVehicle,
        deleteVehicle,

        addDriver,
        updateDriver,
        deleteDriver,
        assignDriverToVehicle,

        addDispatch,
        updateDispatch,
        deleteDispatch,
        advanceDispatchStage,

        updateDelivery,
        addDeliveryNote,
        sendTestNotification,

        addFuelEntry,
        addExpense,

        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,

        simulateTrafficDelay,
        simulateCompletedDelivery,
        simulateFuelRefuel,
        resetAllData,
      }}
    >
      {children}
    </TMSContext.Provider>
  );
};

export const useTMS = () => {
  const context = useContext(TMSContext);
  if (!context) {
    throw new Error('useTMS must be used within a TMSProvider');
  }
  return context;
};
