export interface Order {
    orderId?: number,
    customer: Customer,
    invoice?: Invoice
    departure: Location,
    arrival: Location,
    status: Status,
    departureDate: string,
    arrivalDate: string,
    books: Book[]
}

export interface OrderLite {
    orderId?: number,
    customerId: number,
    invoiceId: number,
    departureId: number,
    arrivalId: number,
    statusId: number,
    departureDate: string,
    arrivalDate: string
}

export interface OrderDetail {
    orderId?: number,
    fullName: string,
    status: Status,
    departureDate: string,
    arrivalDate: string,
    departure: string,
    arrival: string,
    invoiceId: number
}

export interface Book {
    bookId?: number,
    bookType: BookType,
    departure: Location,
    arrival: Location,
    departureDate: string
    arrivalDate: string
}

export interface BookDetail {
    bookId?: number,
    bookType: BookType,
    departure: string,
    arrival: string,
    departureDate: string
    arrivalDate: string
}


export interface Customer {
    customerId?: number,
    firstName: string,
    lastName: string,
    age: number
}

export interface Invoice {
    invoiceId?: number,
    total: number,
    billTo: string,
    locked: number
}

export interface Location {
    code?: string,
    city: string,
    state: string,
    country: string,
    locationId?: number
}

export enum Status {
    'Pending Payment' = 1 ,
    'Recieved' = 2,
    'Confirmed' = 3,
    'Pending' = 4,
    'Cancelled' = 5
}

export enum BookType {
    'Flight' = 1,
    'Car Rental' = 2,
    'Rail' = 3,
    'Shuttle' = 4
}

export interface AuditDetail {
    auditId: number, 
    orderId: number,
    invoiceId: number, 
    status: string, 
    occurredDate: string
}