import { Oracle } from './oracle';
import { createOrder, createInvoice } from './dataSeed';
import { Order, Customer, Location, Book, OrderLite, Invoice, Status } from './interfaces';
import os from 'os';
import random from 'random';
import { startOfMonth, endOfMonth } from 'date-fns'

const isWindows = os.platform() === 'win32';
export async function submitOrder(oracleClient: Oracle) {
    // create random order
    const order = createOrder(); 

    // add customer
    const customerId = await addCustomer(oracleClient, order.customer)

    // add locations (get location)
    const departureId = await addLocation(oracleClient, order.departure)
    const arrivalId = await addLocation(oracleClient, order.arrival)

    // add books, add trigger to fill in location field
    const bookIds = await Promise.all(order.books.map(async (b: Book) => { 
        return await addBook(oracleClient, b);
    }))

    // add full order
    const createdOrderId = await addOrder(oracleClient, order, departureId, arrivalId, customerId);
    // add order to book relationship
    bookIds.forEach(async id => {
        await addOrderBook(oracleClient, createdOrderId, id)
    })

    return {
        order: {
            orderId: createdOrderId,
            customerId: customerId,
            invoiceId: null,
            statusId: order.status
        } as OrderLite,
        customer: {
            customerId: customerId,
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            age: order.customer.age
        } as Customer 
    }
}

export const addCustomer = async (client: Oracle, customer: Customer) => {
    try {
        const customerExists = await getCustomer(client, customer.customerId);
        if(!customerExists) {
            const customerId = await client.addCustomer(customer);
            return customerId;
        }

        return customerExists.customerId;
    } catch(e) {
        return -1;
    }
}

export const addLocation = async (client: Oracle, location: Location): Promise<number> => {
    const locationExists = await getLocation(client, location);
    if(!locationExists) {
        const locationId = await client.addLocation(location);
        return locationId;
    }

    return locationExists.locationId;
}

export const addInvoice = async (client: Oracle, orderId: number): Promise<Invoice> => {
    const existingCustomer = await getCustomerByOrderId(client, orderId);
    const newInvoice = createInvoice(existingCustomer)
    const newInvoiceId = await client.addInvoice(newInvoice);
    return {...newInvoice, invoiceId: newInvoiceId};
}

export const addBook = async (client: Oracle, book: Book) => {
    const departureId = (await addLocation(client, book.departure))
    const arrivalId = (await addLocation(client, book.arrival))
    const bookId = await client.addBook(book, departureId, arrivalId);
    return bookId;
}

export const addOrder = async (client: Oracle, order: Order, departureId: number, arrivalId: number, customerId: number) => {
    const orderId = await client.addOrder(order, departureId, arrivalId, customerId);
    return orderId;
}

export const addOrderBook = async (client: Oracle, orderId: number, bookId: number) => {
    const orderBookId = await client.addOrderBook(orderId, bookId);
    return orderBookId;
}

export const getCustomer = async (client: Oracle, id: number): Promise<Customer | null> => {
    return await client.getCustomer(id) as Customer;
}

export const getCustomerByOrderId = async (client: Oracle, id: number): Promise<Customer | null> => {
    return await client.getCustomerByOrderId(id) as Customer;
}

export const getLocation = async (client: Oracle, location: Location): Promise<Location | null> => {
    return await client.getLocationByCityState(location) as Location;
}

export const getCustomers = async (client: Oracle): Promise<Customer[]> => {
    if(isWindows) {
        return await client.getCustomers() as Customer[];
    } else {
        return await client.getCustomerLite() as Customer[];
    }
}

export const getOrderLites =  async (client: Oracle) => {
    if(isWindows) {
        return await client.getOrderLites() as OrderLite[];
    } else {
        return await client.getGeneratedOrderLites() as OrderLite[];
    }
}

export const getDetails = async (client: Oracle, id: number) => {
    const orderDetails = await client.getOrderDetails(id)
    const invoiceDetails = orderDetails.invoiceId ? await client.getInvoiceDetails(orderDetails.invoiceId) : null;
    const bookDetails = (await client.getBookDetails(id)).sort((a, b) => {
        return (new Date(a.departureDate) as any) - (new Date(b.departureDate) as any)
    })
    const auditDetails = await client.getAuditDetails(id)

    return { orderDetails, invoiceDetails, bookDetails, auditDetails  }
}

export const getCustomerOrders = async (client: Oracle, id: number) => {
    const orderDetails = await client.getOrderDetailsByCustomer(id);

    return orderDetails;
}

export const getMonthlyReport = async (client: Oracle) => {
    const randomMonth = random.int(1, 12)
    const firstOfMonth = startOfMonth(new Date(2021, randomMonth, 1)).toLocaleString()
    const lastOfMonth = endOfMonth(new Date(2021, randomMonth, 1)).toLocaleString()
    const monthlyOrders = await client.getOrdersByMonth(firstOfMonth, lastOfMonth);

    const confirmedTotal = await client.getMonthlyInvoiceTotalByStatus(firstOfMonth, lastOfMonth, +Status.Confirmed);

    const recievedTotal = await client.getMonthlyInvoiceTotalByStatus(firstOfMonth, lastOfMonth, + Status.Recieved);
    return { monthlyOrders, confirmedTotal, recievedTotal, firstOfMonth, lastOfMonth};
}

export const getInvoice = async (client: Oracle, orderId: number) => {
    const invoice = await client.getInvoiceDetailsByOrderId(orderId);

    return invoice;
}

export const updateOrderInvoice = async (client: Oracle, orderId: number, invoiceId: number) => {
    const updated = await client.updateOrderInvoice(orderId, invoiceId);

    return updated;
}

export const updateOrderStatusConfirmed = async (client: Oracle, orderId: number) => {
    const updated = await client.updateOrderStatusConfirmed(orderId);

    return updated;
}


export const updateOrderStatusCancelled = async (client: Oracle, orderId: number) => {
    const updated = await client.updateOrderStatusCancelled(orderId);

    return updated;
}

export const updateInvoiceLocked = async (client: Oracle, orderId: number) => {
    const invoice = await client.getInvoiceDetailsByOrderId(orderId);
    const updated = await client.updateInvoiceLocked(invoice.invoiceId);

    return updated;
}

export const deleteOrder = async (client: Oracle, id: number): Promise<void> => {
    await client.deleteOrder(id);
}