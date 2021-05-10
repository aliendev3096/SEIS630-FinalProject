import oracledb  from 'oracledb';
import { Order, Customer, Location, Book, OrderLite, OrderDetail, Invoice, BookDetail, AuditDetail } from './interfaces';
import { createCustomer, createOrderLite } from './dataSeed';

export class Oracle {
    connection: oracledb.Connection
    config: any;
    constructor(config: any) {
        this.connection = null;
        this.config = config;
    }

    establishConnection = async () => {
        try {
            if(!this.connection) {
                this.connection = await oracledb.getConnection(this.config);
                this.connection ? console.log('Database Connected') : console.log(`Unable to connect to ${this.config.connectionString}`)
            }
            return true;
        }
        catch(e: any)
        { 
            return false;
        }
    }
    addCustomer = async (data: Customer) => {
        const result = await this.connection.execute(
            `BEGIN
                AddCustomer(:Param_FirstName, :Param_LastName, :Param_Age, :Param_Customer_ID);
            END;`,
            {
                Param_FirstName:  data.firstName,
                Param_LastName: data.lastName,
                Param_Age: data.age,
                Param_Customer_ID:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        )
        this.connection.commit()
        return (result.outBinds as any).Param_Customer_ID as number;
    }
    addLocation = async (data: Location) => {
        const result = await this.connection.execute(
            `BEGIN
                AddLocation(:Param_Country, :Param_State, :Param_City, :Param_AirportCode, :Param_Location_ID);
            END;`,
            {
                Param_Country:  data.country,
                Param_State: data.state,
                Param_City: data.city,
                Param_AirportCode: data.code,
                Param_Location_ID:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        )
        this.connection.commit()
        return (result.outBinds as any).Param_Location_ID as number;
    }
    addBook = async (data: Book, departureId: number, arrivalId: number) => {
        const result = await this.connection.execute(
            `BEGIN
                AddBook(:Param_BookTypeId, :Param_DepartureId, :Param_ArrivalId, :Param_DepartureDate, :Param_ArrivalDate, :Param_BookId);
            END;`,
            {
                Param_BookTypeId:  { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: data.bookType },
                Param_DepartureId: departureId,
                Param_ArrivalId: arrivalId ,
                Param_DepartureDate:  data.departureDate,
                Param_ArrivalDate:  data.arrivalDate,
                Param_BookId:  { type: oracledb.NUMBER, dir: oracledb.BIND_INOUT }
            }
        )
        this.connection.commit()
        return (result.outBinds as any).Param_BookId as number;
    }
    addOrder = async (data: Order, departureId: number, arrivalId: number, customerId: number) => {
        const result = await this.connection.execute(
            `BEGIN
                AddOrder(:Param_CustomerId, :Param_DepartureId, :Param_ArrivalId, :Param_StatusId, :Param_DepartureDate, :Param_ArrivalDate, :Param_OrderId);
            END;`,
            {
                Param_CustomerId: customerId,
                Param_DepartureId: departureId,
                Param_ArrivalId: arrivalId,
                Param_StatusId: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: data.status },
                Param_DepartureDate:  data.departureDate,
                Param_ArrivalDate:  data.arrivalDate,
                Param_OrderId:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        )
        this.connection.commit()
        return (result.outBinds as any).Param_OrderId as number;
    }
    updateOrderInvoice = async (orderId: number, invoiceId: number) => {
        await this.connection.execute(
            `BEGIN
                UpdateOrderInvoice(:Param_OrderId, :Param_InvoiceId);
            END;`,
            {
                Param_OrderId: orderId,
                Param_InvoiceId: invoiceId
            }
        )
        this.connection.commit()
    }
    updateOrderStatusConfirmed = async (orderId: number) => {
        await this.connection.execute(
            `BEGIN
                UpdateOrderStatusConfirmed(:Param_OrderId);
            END;`,
            {
                Param_OrderId: orderId,
            }
        )
        this.connection.commit()
    }
    updateOrderStatusCancelled = async (orderId: number) => {
        await this.connection.execute(
            `BEGIN
                UpdateOrderStatusCancelled(:Param_OrderId);
            END;`,
            {
                Param_OrderId: orderId,
            }
        )
        this.connection.commit()
    }
    updateInvoiceLocked = async (invoiceId: number) => {
        await this.connection.execute(
            `BEGIN
                UpdateInvoiceLocked(:Param_InvoiceId);
            END;`,
            {
                Param_InvoiceId: invoiceId,
            }
        )
        this.connection.commit()
    }
    addOrderBook = async (orderId: number, bookId: number) => {
        const result = await this.connection.execute(
            `BEGIN
                AddOrderedBook(:Param_OrderId, :Param_BookId, :Param_OrderedBookId);
            END;`,
            {
                Param_OrderId: orderId,
                Param_BookId: bookId,
                Param_OrderedBookId:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        )
        this.connection.commit()
        return (result.outBinds as any).Param_OrderBookId as number;
    }
    addInvoice = async (data: Invoice) => {
        const result = await this.connection.execute(
            `BEGIN
                AddInvoice(:Param_BillTo, :Param_Locked, :Param_Total, :Param_InvoiceID);
            END;`,
            {
                Param_BillTo:  data.billTo,
                Param_Locked: { val: data.locked, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
                Param_Total: data.total,
                Param_InvoiceID:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        )
        this.connection.commit()
        return (result.outBinds as any).Param_InvoiceID as number;
    }
    getCustomer = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetCustomer(:Param_CustomerID, :Param_FirstName, :Param_LastName, :Param_Age);
                END;`,
                {
                    Param_CustomerID:  id,
                    Param_FirstName:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_LastName: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Age: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                }
            )
            return {
                customerId: id,
                firstName: (result.outBinds as any).Param_FirstName,
                lastName: (result.outBinds as any).Param_LastName,
                age: (result.outBinds as any).Param_Age
            } as Customer;
        } catch(e) {
            return null;
        }
    }
    getCustomerByOrderId = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetCustomerByOrderId(:Param_OrderID, :Param_CustomerID, :Param_FirstName, :Param_LastName, :Param_Age);
                END;`,
                {
                    Param_OrderID:  id,
                    Param_CustomerID: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    Param_FirstName:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_LastName: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Age: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                }
            )
            return {
                customerId: (result.outBinds as any).Param_CustomerID,
                firstName: (result.outBinds as any).Param_FirstName,
                lastName: (result.outBinds as any).Param_LastName,
                age: (result.outBinds as any).Param_Age
            } as Customer;
        } catch(e) {
            return null;
        }
    }
    getLocationByCityState = async (location: Location) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetLocation(:Param_Country, :Param_State, :Param_City, :Param_AirportCode, :Param_Location_ID);
                END;`,
                {
                    Param_Country:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_State: { val: location.state, type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_INOUT },
                    Param_City: { val: location.city, type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_INOUT },
                    Param_AirportCode: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Location_ID:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                }
            )
            return {
                locationId: (result.outBinds as any).Param_Location_ID as number,
                state: (result.outBinds as any).Param_State as string,
                city: (result.outBinds as any).Param_City as string,
                code: (result.outBinds as any).Param_AirportCode as string,
                country: (result.outBinds as any).Param_Country as string
            } as Location
        } catch(e) {
            return null;
        }
    }
    getLocationById = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetLocationById(:Param_Country, :Param_State, :Param_City, :Param_AirportCode, :Param_Location_ID);
                END;`,
                {
                    Param_Country:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_State: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_City: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_AirportCode: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Location_ID:  { val: id, type: oracledb.NUMBER, dir: oracledb.BIND_INOUT }
                }
            )
            return {
                locationId: (result.outBinds as any).Param_Location_ID as number,
                state: (result.outBinds as any).Param_State as string,
                city: (result.outBinds as any).Param_City as string,
                code: (result.outBinds as any).Param_AirportCode as string,
                country: (result.outBinds as any).Param_Country as string
            } as Location
        } catch(e) {
            return null;
        }
    }
    getCustomers = async () => {
        const customers: Customer[] = [];
        const result = await this.connection.execute(
            `BEGIN
                GetCustomers(:cursorParam);
            END;`,
            {
                cursorParam:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        )

        const dataSet = (result.outBinds as any).cursorParam; 
        const numRows = 10;
        let rows;
    
        do {
            rows = await dataSet.getRows(numRows); // get numRows rows at a time
            if (rows.length > 0) {
                rows.forEach((r: any) => {
                    customers.push({ customerId: r[0], firstName: r[1], age: r[2], lastName: r[3] } as Customer)
                })
            }
        } while (rows.length === numRows);
        return customers;
    }
    getCustomerLite = async () => {
        return [createCustomer(), createCustomer()] as Customer[]
    }
    getOrderLites = async () => {
        const orders: OrderLite[] = [];
        const result = await this.connection.execute(
            `BEGIN
                GetOrders(:cursorParam);
            END;`,
            {
                cursorParam:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        )
        const dataSet = (result.outBinds as any).cursorParam; 
        const numRows = 10;
        let rows;
    
        do {
            rows = await dataSet.getRows(numRows); // get numRows rows at a time
            if (rows.length > 0) {
            rows.forEach((r: any) => {
                orders.push({ 
                    orderId: r[0], 
                    customerId: r[1], 
                    invoiceId: r[2], 
                    departureId: r[3], 
                    arrivalId: r[4], 
                    statusId: r[5], 
                    departureDate: r[6], 
                    arrivalDate: r[7]
                } as OrderLite)
            })
            }
        } while (rows.length === numRows);
        return orders;
    }
    getOrdersByMonth = async (start: string, end: string) => {
        const orders: OrderLite[] = [];
        const result = await this.connection.execute(
            `BEGIN
                GetOrdersByMonth(:Param_StartDate, :Param_EndDate, :cursorParam);
            END;`,
            {
                cursorParam:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                Param_StartDate:  { val: start, type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN },
                Param_EndDate:  { val: end, type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_IN },
            }
        )
        const dataSet = (result.outBinds as any).cursorParam; 
        const numRows = 10;
        let rows;
    
        do {
            rows = await dataSet.getRows(numRows); // get numRows rows at a time
            if (rows.length > 0) {
            rows.forEach((r: any) => {
                orders.push({ 
                    orderId: r[0], 
                    customerId: r[1], 
                    invoiceId: r[2], 
                    departureId: r[3], 
                    arrivalId: r[4], 
                    statusId: r[5], 
                    departureDate: r[6], 
                    arrivalDate: r[7]
                } as OrderLite)
            })
            }
        } while (rows.length === numRows);
        return orders;
    }
    getGeneratedOrderLites = async () => {
        return [createOrderLite(), createOrderLite()] as OrderLite[]
    }
    getOrderDetails = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetOrderDetail(:Param_OrderId, :Param_FirstName, :Param_LastName, :Param_Status, :Param_DepartureDate, :Param_ArrivalDate, :Param_InvoiceId);
                END;`,
                {
                    Param_OrderId: id,
                    Param_FirstName:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_LastName: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Status: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_DepartureDate:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_ArrivalDate:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_InvoiceId:  { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                }
            )
            const departureResult = await this.connection.execute(
                `BEGIN
                GetOrderDeparture(:Param_OrderId, :Param_City, :Param_State);
                END;`,
                {
                    Param_OrderId: id,
                    Param_City:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_State: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                }
            )
            const arrivalResult = await this.connection.execute(
                `BEGIN
                GetOrderArrival(:Param_OrderId, :Param_City, :Param_State);
                END;`,
                {
                    Param_OrderId: id,
                    Param_City:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_State: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                }
            )

            return {
                orderId: id,
                fullName: `${(result.outBinds as any).Param_FirstName} ${(result.outBinds as any).Param_LastName}`,
                status: (result.outBinds as any).Param_Status,
                departureDate: (result.outBinds as any).Param_DepartureDate,
                arrivalDate: (result.outBinds as any).Param_ArrivalDate,
                departure: `${(departureResult.outBinds as any).Param_City}, ${(departureResult.outBinds as any).Param_State}`,
                arrival: `${(arrivalResult.outBinds as any).Param_City}, ${(arrivalResult.outBinds as any).Param_State}`,
                invoiceId: (result.outBinds as any).Param_InvoiceId
            } as OrderDetail;
        } catch(e) {
            return null;
        }
    }
    getInvoiceDetails = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetInvoice(:Param_InvoiceId, :Param_BillTo, :Param_Locked, :Param_Total);
                END;`,
                {
                    Param_InvoiceId: id,
                    Param_BillTo:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Locked: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    Param_Total: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                }
            )

            return {
                invoiceId: id,
                billTo: (result.outBinds as any).Param_BillTo,
                locked:  (result.outBinds as any).Param_Locked,
                total:  (result.outBinds as any).Param_Total,
            } as Invoice;
        } catch(e) {
            return null;
        }
    }
    getMonthlyInvoiceTotalByStatus = async (start: string, end: string, statusId: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetMonthlyInvoiceTotalByStatus(:Param_Start, :Param_End, :Param_Status, :Param_Total);
                END;`,
                {
                    Param_Start: start,
                    Param_End: end, 
                    Param_Status: statusId,
                    Param_Total: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                }
            )
            return (result.outBinds as any).Param_Total as number
        } catch(e) {
            return null;
        }
    }
    getInvoiceDetailsByOrderId = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    GetInvoiceByOrderId(:Param_OrderId, :Param_InvoiceId, :Param_BillTo, :Param_Locked, :Param_Total);
                END;`,
                {
                    Param_OrderId: id,
                    Param_InvoiceId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    Param_BillTo:  { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                    Param_Locked: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                    Param_Total: { type: oracledb.DB_TYPE_VARCHAR, dir: oracledb.BIND_OUT },
                }
            )

            return {
                invoiceId:  (result.outBinds as any).Param_InvoiceId,
                billTo: (result.outBinds as any).Param_BillTo,
                locked:  (result.outBinds as any).Param_Locked,
                total:  (result.outBinds as any).Param_Total,
            } as Invoice;
        } catch(e) {
            return null;
        }
    }
    getBookDetails = async (id: number) => {
        try {
            const subBook: any[] = [];

            const result = await this.connection.execute(
                `BEGIN
                    GetBookDetail(:cursorParam, :Param_OrderId);
                END;`,
                {
                    Param_OrderId: id,
                    cursorParam:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
                }
            )

            const dataSet = (result.outBinds as any).cursorParam; 
            const numRows = 10;
            let rows;
        
            do {
                rows = await dataSet.getRows(numRows); // get numRows rows at a time
                if (rows.length > 0) {
                    rows.forEach((r: any) => {
                        subBook.push({ bookId: r[0], bookType: r[1], departureId: r[2], arrivalId: r[3], departureDate: r[4], arrivalDate: r[5] })
                    })
                }
            } while (rows.length === numRows);

            return await Promise.all(subBook.map(async (b) => {
                const departure = await this.getLocationById(b.departureId)
                const arrival = await this.getLocationById(b.arrivalId)
                return {
                    bookId: b.bookId,
                    bookType: b.bookType,
                    departure: `${departure.city}, ${departure.state}`,
                    arrival: `${arrival.city}, ${arrival.state}`,
                    departureDate: b.departureDate,
                    arrivalDate: b.arrivalDate
                } as BookDetail;
            }))
        } catch(e) {
            return null;
        }
    }
    getOrderDetailsByCustomer = async (id: number) => {
        try {
            const partialOrders: any[] = [];

            const result = await this.connection.execute(
                `BEGIN
                    GetOrderDetailByCustomer(:Param_CustomerId, :cursorParam);
                END;`,
                {
                    Param_CustomerId: id,
                    cursorParam:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
                }
            )

            const dataSet = (result.outBinds as any).cursorParam; 
            const numRows = 10;
            let rows;
        
            do {
                rows = await dataSet.getRows(numRows);
                if (rows.length > 0) {
                    rows.forEach((r: any) => {
                        partialOrders.push({ orderId: r[0], status: r[1], departureId: r[2], arrivalId: r[3], departureDate: r[4], arrivalDate: r[5], invoice: r[6] })
                    })
                }
            } while (rows.length === numRows);

            return await Promise.all(partialOrders.map(async (b) => {
                const departure = await this.getLocationById(b.departureId)
                const arrival = await this.getLocationById(b.arrivalId)
                return {
                    orderId: b.orderId,
                    departure: `${departure.city}, ${departure.state}`,
                    arrival: `${arrival.city}, ${arrival.state}`,
                    departureDate: b.departureDate, 
                    arrivalDate: b.arrivalDate,
                    status: b.status,
                    invoiceId: b.invoice
                } as OrderDetail;
            }))
        } catch(e) {
            return null;
        }
    }
    getAuditDetails = async (id: number) => {
        try {
            const subAudits: any[] = [];

            const result = await this.connection.execute(
                `BEGIN
                    GetAuditDetail(:cursorParam, :Param_OrderId);
                END;`,
                {
                    Param_OrderId: id,
                    cursorParam:  { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
                }
            )

            const dataSet = (result.outBinds as any).cursorParam; 
            const numRows = 10;
            let rows;
        
            do {
                rows = await dataSet.getRows(numRows); // get numRows rows at a time
                if (rows.length > 0) {
                    rows.forEach((r: any) => {
                        subAudits.push({ auditId: r[0], orderId: r[1], invoiceId: r[2], status: r[3], occurredDate: r[4] })
                    })
                }
            } while (rows.length === numRows);

            return await Promise.all(subAudits.map(async (b) => {
                return {
                    auditId: b.auditId,
                    orderId: b.orderId,
                    invoiceId: b.invoiceId, 
                    status: b.status, 
                    occurredDate: b.occurredDate
                } as AuditDetail;
            }))
        } catch(e) {
            return null;
        }
    }
    deleteOrder = async (id: number) => {
        try {
            const result = await this.connection.execute(
                `BEGIN
                    DeleteOrder(:Param_Id);
                END;`,
                {
                    Param_Id: id
                }
            )
            this.connection.commit() 
        } catch(e) {
            throw e
        }
    }
}