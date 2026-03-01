export interface PaginationMeta {
  current: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  current: number;
  pageSize: number;
  sort?: string;
}

export interface PermissionItem {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  description: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRef {
  _id: string;
  name: string;
}

export interface UserPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface SigninDto {
  email: string;
  password: string;
}

export interface SigninUserInfo {
  _id: string;
  name: string;
  email: string;
  role: RoleRef;
  permissions: UserPermission[];
}

export interface SigninData {
  accessToken: string;
  user: SigninUserInfo;
}

export interface AccountData {
  _id: string;
  name: string;
  email: string;
  role: RoleRef;
  permissions: UserPermission[];
}

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string | RoleRef;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  userId: string;
  newPassword: string;
}

export interface RoleItem {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface CreatePermissionDto {
  name: string;
  apiPath: string;
  method: string;
  module: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
  description?: string;
  isActive?: boolean;
}

export interface WarehouseItem {
  _id: string;
  inches: number;
  item: string;
  quality: string;
  style: string;
  color: string;
  totalAmount: number;
  amountOccupied: number;
  amountAvailable: number;
  unitOfCalculation: string;
  priceHigh: number;
  priceLow: number;
  sale: number;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  inches: number;
  item: string;
  quality: string;
  style: string;
  color: string;
  totalAmount: number;
  unitOfCalculation: string;
  priceHigh?: number;
  priceLow?: number;
  sale?: number;
}

export interface UpdateWarehouseDto {
  inches?: number;
  item?: string;
  quality?: string;
  style?: string;
  color?: string;
  totalAmount?: number;
  amountOccupied?: number;
  amountAvailable?: number;
  unitOfCalculation?: string;
  priceHigh?: number;
  priceLow?: number;
  sale?: number;
}

export interface AddStockBodyDto {
  id: string;
  quantity: number;
  note?: string;
}

export interface CustomerItem {
  _id: string;
  name: string;
  payment: number;
  note: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  payment?: number;
  note?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  payment?: number;
  note?: string;
}

export interface OrderItemDto {
  id: string;
  quantity: number;
  price: number;
  sale: number;
  customPrice: boolean;
  customSale: boolean;
  unitOfCalculation: string;
}

export interface OrderProductDto {
  nameSet: string;
  priceSet: number;
  quantitySet: number;
  saleSet: number;
  isCalcSet: boolean;
  items: OrderItemDto[];
}

export interface OrderHistoryDto {
  type: string;
  exchangeRate: number;
  moneyPaidNGN: number;
  moneyPaidDolar: number;
  paymentMethod: string;
  datePaid: string;
  note: string;
}

export interface OrderCustomerRef {
  _id: string;
  name: string;
}

export interface OrderCreatorRef {
  _id: string;
  name: string;
}

export interface OrderDetail {
  _id: string;
  type: "cao" | "thấp";
  state: string;
  exchangeRate: number;
  customer: OrderCustomerRef;
  totalPrice: number;
  payment: number;
  debt?: number;
  paid?: number;
  note: string;
  products: OrderProductDto[];
  history: OrderHistoryDto[];
  createdBy: string | OrderCreatorRef;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  id: string;
  quantity: number;
  price: number;
  sale?: number;
  customPrice?: boolean;
  customSale?: boolean;
  unitOfCalculation: string;
}

export interface CreateOrderProductDto {
  nameSet?: string;
  priceSet?: number;
  quantitySet?: number;
  saleSet?: number;
  isCalcSet?: boolean;
  items: CreateOrderItemDto[];
}

export interface CreateOrderDto {
  type: "cao" | "thấp";
  exchangeRate: number;
  customer: string;
  debt?: number;
  paid?: number;
  note?: string;
  products: CreateOrderProductDto[];
}

export interface UpdateOrderDto {
  type?: "cao" | "thấp";
  exchangeRate?: number;
  customer?: string;
  debt?: number;
  paid?: number;
  note?: string;
  products?: CreateOrderProductDto[];
}

export interface AddHistoryDto {
  type: "khách trả" | "hoàn tiền";
  exchangeRate: number;
  moneyPaidNGN: number;
  moneyPaidDolar: number;
  paymentMethod: string;
  datePaid: string;
  note?: string;
}

export interface RevertOrderDto {
  note: string;
}

export interface HistoryEnterMetadata {
  totalAmount?: number;
  amountAvailable?: number;
  amountOccupied?: number;
  priceHigh?: number;
  priceLow?: number;
  sale?: number;
  quantity?: number;
  quantityRevert?: number;
  orderId?: string | { _id: string };
  priceHighNew?: number;
  priceHighOld?: number;
  priceLowNew?: number;
  priceLowOld?: number;
  saleNew?: number;
  saleOld?: number;
}

export interface HistoryEnterItem {
  _id: string;
  warehouseId: string | { _id: string };
  item: string;
  inches: number;
  quality: string;
  style: string;
  color: string;
  type: "Tạo mới" | "Nhập thêm hàng" | "Hoàn đơn" | "Sửa giá" | "Xóa";
  metadata: HistoryEnterMetadata;
  note?: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHistoryEnterDto {
  warehouseId: string;
  item: string;
  inches: number;
  quality: string;
  style: string;
  color: string;
  type: "Tạo mới" | "Nhập thêm hàng" | "Hoàn đơn" | "Sửa giá" | "Xóa";
  metadata: HistoryEnterMetadata;
  note?: string;
}

export interface UpdateHistoryEnterDto {
  warehouseId?: string;
  item?: string;
  inches?: number;
  quality?: string;
  style?: string;
  color?: string;
  type?: "Tạo mới" | "Nhập thêm hàng" | "Hoàn đơn" | "Sửa giá" | "Xóa";
  metadata?: HistoryEnterMetadata;
  note?: string;
}

export interface HistoryExportItem {
  _id: string;
  warehouseId: string | { _id: string };
  item: string;
  inches: number;
  quality: string;
  style: string;
  color: string;
  priceHigh: number;
  priceLow: number;
  sale: number;
  orderId: string | { _id: string };
  type: "cao" | "thấp";
  priceOrder: number;
  saleOrder: number;
  quantityOrder: number;
  stateOrder: "Khách trả" | "Hoàn đơn";
  paymentOrder: number;
  note?: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHistoryExportDto {
  warehouseId: string;
  item: string;
  inches: number;
  quality: string;
  style: string;
  color: string;
  priceHigh: number;
  priceLow: number;
  sale: number;
  orderId: string;
  type: "cao" | "thấp";
  priceOrder: number;
  saleOrder: number;
  quantityOrder: number;
  stateOrder: "Khách trả" | "Hoàn đơn";
  paymentOrder: number;
  note?: string;
}

export interface UpdateHistoryExportDto {
  warehouseId?: string;
  item?: string;
  inches?: number;
  quality?: string;
  style?: string;
  color?: string;
  priceHigh?: number;
  priceLow?: number;
  sale?: number;
  orderId?: string;
  type?: "cao" | "thấp";
  priceOrder?: number;
  saleOrder?: number;
  quantityOrder?: number;
  stateOrder?: "Khách trả" | "Hoàn đơn";
  paymentOrder?: number;
  note?: string;
}
