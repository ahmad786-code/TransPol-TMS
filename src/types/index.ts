export type Language = 'pl' | 'en';

export type VehicleStatus = 'available' | 'in_transit' | 'maintenance' | 'delayed';
export type VehicleType = 'curtain_semitrailer' | 'mega' | 'refrigerated' | 'box_truck' | 'flatbed';

export interface Vehicle {
  id: string;
  registration: string;
  brandModel: string;
  type: VehicleType;
  year: number;
  euroStandard: string;
  location: string;
  assignedDriverId?: string;
  status: VehicleStatus;
  fuelLevelPercent: number;
  mileageKm: number;
  nextServiceDate: string;
  technicalInspectionDate: string;
  vin: string;
  tankCapacityLiters: number;
  averageConsumptionLPer100Km: number;
}

export type DriverStatus = 'available' | 'driving' | 'resting' | 'off_duty';

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  assignedVehicleId?: string;
  status: DriverStatus;
  currentRoute?: string;
  drivingHoursToday: number;
  maxDrivingHoursDaily: number;
  drivingHoursWeek: number;
  maxDrivingHoursWeekly: number;
  restTimeLeftHours: number;
  licenceCategories: string[];
  medicalExamExpiry: string;
  adrCertified: boolean;
  code95Expiry: string;
  upcomingAvailability: string;
}

export type DispatchStatus = 'planned' | 'assigned' | 'in_transit' | 'delivered' | 'delayed';
export type DispatchPriority = 'normal' | 'high' | 'urgent';

export interface Dispatch {
  id: string;
  dispatchNumber: string;
  customerName: string;
  originCity: string;
  originAddress: string;
  destinationCity: string;
  destinationAddress: string;
  cargoDescription: string;
  weightTonnes: number;
  palletCount: number;
  vehicleId?: string;
  driverId?: string;
  plannedPickupDate: string;
  plannedPickupTime: string;
  plannedDeliveryDate: string;
  plannedDeliveryTime: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  status: DispatchStatus;
  priority: DispatchPriority;
  ratePln: number;
  notes?: string;
  routeDistanceKm: number;
  createdAt: string;
}

export interface DeliveryMilestone {
  step: number;
  name: string;
  time?: string;
  completed: boolean;
  current?: boolean;
}

export interface Delivery {
  id: string;
  dispatchId: string;
  trackingNumber: string;
  currentLocationCity: string;
  progressPercent: number;
  estimatedDeliveryTime: string;
  delayMinutes: number;
  delayReason?: string;
  speedKmh?: number;
  distanceRemainingKm: number;
  milestones: DeliveryMilestone[];
  customerNotificationPhone: string;
  customerNotificationEmail: string;
  lastNotificationSentAt?: string;
  driverNotes?: string[];
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  driverId?: string;
  date: string;
  liters: number;
  costPln: number;
  pricePerLiterPln: number;
  odometerKm: number;
  gasStation: string;
  city: string;
  calculatedConsumptionL100Km?: number;
  paymentMethod: string;
}

export type ExpenseCategory = 'fuel' | 'toll_etoll' | 'maintenance' | 'driver_allowance' | 'leasing' | 'insurance' | 'other';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  vehicleId?: string;
  amountPln: number;
  description: string;
  invoiceNumber: string;
  vendorName: string;
}

export interface OperationalNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'warning' | 'info' | 'success' | 'danger';
  targetTab?: string;
  entityId?: string;
}

export interface DashboardMetrics {
  activeTrucks: number;
  availableTrucks: number;
  deliveriesInProgress: number;
  deliveriesAtRisk: number;
  monthlyFuelExpensesPln: number;
  estimatedOperatingCostsPln: number;
  totalFleetCount: number;
  onTimeDeliveryRatePercent: number;
  averageConsumptionL100Km: number;
  revenueThisMonthPln: number;
}
