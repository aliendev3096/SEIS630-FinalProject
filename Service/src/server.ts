import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { Oracle } from './oracle';
import { dbconfig } from './dbconfig';
import { 
    submitOrder, 
    getOrderLites,
    getCustomers, 
    getDetails, 
    getCustomer, 
    getCustomerOrders, 
    addInvoice, 
    updateOrderInvoice, 
    getInvoice, 
    updateInvoiceLocked, 
    updateOrderStatusConfirmed,
    updateOrderStatusCancelled,
    deleteOrder,
    getMonthlyReport } from './repository';
import os from 'os';

const isWindows = os.platform() === 'win32';
const port = 3000;
const app = express();
const httpServer = new http.Server(app)
const ioServer = new Server(httpServer);
const oracleClient = new Oracle(dbconfig);
const moduleURL = new URL(import.meta.url);
const fullPath = path.dirname(moduleURL.pathname);
const __dirname = isWindows ? fullPath.replace('/','') : fullPath;

ioServer.on('connection', async (socket) => {
    if(isWindows) {
        await oracleClient.establishConnection()
    }

    const customers = await getCustomers(oracleClient)
    const orders = await getOrderLites(oracleClient)

    socket.emit('Retrieved All Data', { customers, orders })
    socket.on('Add Order', async () => {
        try {
            const createAssets = await submitOrder(oracleClient)
            socket.emit("Order Placed", createAssets)
        } catch(e) {
            socket.emit('error', e.message)
        }
    })

    socket.on('Get Orders', async () => {
        await getOrderLites(oracleClient)
    })

    socket.on('Get Monthly Report', async () => {
        try {
            const report = await getMonthlyReport(oracleClient)
            socket.emit('Retrieved Monthly Report', report)
        } catch(e) {
            socket.emit('error', e.message)
        }
    })

    socket.on('Retrieve Order Detail', async (data) => {
        try {
        const details = await getDetails(oracleClient, data)
        socket.emit('Retrieved Order Details', details)
        } catch(e) {
            socket.emit('error', e.message)
        }
    })

    socket.on('Retrieve Customer', async (data) => {
        try {
        const customer = await getCustomer(oracleClient, data)
        socket.emit('Retrieved Customer', customer)
        } catch(e) {
            socket.emit('error', e.message)
        }
    })

    socket.on('Retrieve Customer Orders', async (data) => {
        try {
        const orders = await getCustomerOrders(oracleClient, data)
        socket.emit('Retrieved Customer Orders', orders)
        } catch(e) {
            socket.emit('error', e.message)
        }
    })

    socket.on('Create Invoice', async (data) => {
        try {
        const invoiceExists = await getInvoice(oracleClient, data);
        if(invoiceExists) {
            throw `Invoice already exists for order: ${data}`
        }
        const invoice = await addInvoice(oracleClient, data)
        updateOrderInvoice(oracleClient, data, invoice.invoiceId)
        const details = (await getDetails(oracleClient, data))
        socket.emit('Created Invoice', { invoice, order: details.orderDetails, audit: details.auditDetails })
        } catch(e) {
            socket.emit('error', e)
        }
    })

    socket.on('Make Payment', async (data) => {
        try {
            const invoice = await getInvoice(oracleClient, data);
            if(!invoice || invoice.locked) {
                throw `Invoice does not exist for order: ${data} or is currently locked.`
            }
            updateOrderStatusConfirmed(oracleClient, data);
            updateInvoiceLocked(oracleClient, data);
            const details = await getDetails(oracleClient, data)

            socket.emit('Payment Made', { order: details.orderDetails, invoice: details.invoiceDetails, audit: details.auditDetails })
        } catch(e) {
            socket.emit('error', e)
        }
    })

    socket.on('Cancel Order', async (data) => {
        try {
            const invoice = await getInvoice(oracleClient, data);
            if(!invoice.locked) {
                updateInvoiceLocked(oracleClient, data);
            }
            updateOrderStatusCancelled(oracleClient, data);
            const details = await getDetails(oracleClient, data)

            socket.emit('Order Cancelled', { order: details.orderDetails, invoice: details.invoiceDetails, audit: details.auditDetails })
        } catch(e) {
            socket.emit('error', e)
        }
    })
    
    socket.on('Delete Order', async (data) => {
        try {
            deleteOrder(oracleClient, data)
            socket.emit('Order Deleted', null)
        } catch(e) {
            socket.emit('error', e)
        }
    })
})

app.get( "/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get( "/orders/:id", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'order.html'));
});

app.get( "/customers/:id", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'customer.html'));
});

app.use(express.static(path.join(__dirname, 'js')))
app.use(express.static(path.join(__dirname, 'css')))

httpServer.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
