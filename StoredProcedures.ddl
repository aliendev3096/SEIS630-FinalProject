/* Add Customer */
CREATE OR REPLACE PROCEDURE AddCustomer
(
    Param_FirstName IN VARCHAR,
    Param_LastName IN VARCHAR,
    Param_Age IN INTEGER,
    Param_Customer_ID OUT Integer
)
AS
BEGIN
    INSERT INTO CUSTOMER (FirstName, LastName, Age) VALUES (Param_FirstName, Param_LastName, Param_Age)
    returning Customer_ID into Param_Customer_ID;
END;

/* Add Location */
CREATE OR REPLACE PROCEDURE AddLocation
(
    Param_Country IN VARCHAR,
    Param_State IN VARCHAR,
    Param_City IN VARCHAR,
    Param_AirportCode IN VARCHAR,
    Param_Location_ID OUT Integer
)
AS
BEGIN
    INSERT INTO LOCATION (Country, State, City, AirportCode) VALUES (Param_Country, Param_State, Param_City, Param_AirportCode)
    returning Location_ID into Param_Location_ID;
END;

/* Add Book */
CREATE OR REPLACE PROCEDURE AddBook
(
    Param_BookTypeId IN Integer,
    Param_DepartureId IN Integer,
    Param_ArrivalId IN Integer,
    Param_DepartureDate IN VARCHAR, 
    Param_ArrivalDate IN VARCHAR,
    Param_BookId OUT Integer
)
AS
BEGIN
    INSERT INTO BOOK (BookType_ID, Departure_ID, Arrival_ID, DepartureDate, ArrivalDate) VALUES (Param_BookTypeId, Param_DepartureId, Param_Arrival_Id, Param_DepartureDate, Param_ArrivalDate)
    returning Book_ID into Param_BookId;
END;

/* Add Order */
CREATE OR REPLACE PROCEDURE AddOrder
(
    Param_CustomerId IN Integer,
    Param_DepartureId IN Integer,
    Param_ArrivalId IN Integer,
    Param_StatusId IN Integer, 
    Param_DepartureDate IN VARCHAR,
    Param_ArrivalDate IN VARCHAR,
    Param_OrderId OUT Integer
)
AS
BEGIN
    INSERT INTO ORDERS (Customer_ID, Departure_ID, Arrival_ID, Status_ID, DepartureDate, ArrivalDate) VALUES (Param_CustomerId, Param_DepartureId, Param_ArrivalId, Param_StatusId, Param_DepartureDate, Param_ArrivalDate)
    returning Order_ID into Param_OrderId;
END;

/* Add Ordered Books */
CREATE OR REPLACE PROCEDURE AddOrderedBook
(
    Param_OrderId IN Integer,
    Param_BookId IN Integer,
    Param_OrderBookId OUT Integer
)
AS
BEGIN
    INSERT INTO ORDEREDBOOKS (Order_ID, Book_ID) VALUES (Param_OrderId, Param_BookId)
    returning OrderedBook_ID into Param_OrderBookId;
END;

/* Get Location */
CREATE OR REPLACE PROCEDURE GetLocation
(
    Param_Country OUT VARCHAR,
    Param_State IN OUT VARCHAR,
    Param_City IN OUT VARCHAR,
    Param_AirportCode OUT VARCHAR,
    Param_Location_ID OUT INTEGER
)
AS
BEGIN
      SELECT Country , State, City, AirportCode, Location_ID
      INTO Param_Country, Param_State,  Param_City, Param_AirportCode, Param_Location_ID
      from  Location WHERE State = Param_State AND City = Param_City;
END;

/* Get Location By Id*/
CREATE OR REPLACE PROCEDURE GetLocationById
(
    Param_Country OUT VARCHAR,
    Param_State OUT VARCHAR,
    Param_City OUT VARCHAR,
    Param_AirportCode OUT VARCHAR,
    Param_Location_ID IN OUT INTEGER
)
AS
BEGIN
      SELECT Country , State, City, AirportCode, Location_ID
      INTO Param_Country, Param_State,  Param_City, Param_AirportCode, Param_Location_ID
      from  Location WHERE Location_ID = Param_Location_ID;
END;

/* Get Customer */
CREATE OR REPLACE PROCEDURE GetCustomer
(
    Param_CustomerID IN OUT INTEGER,
    Param_FirstName OUT VARCHAR,
    Param_LastName OUT VARCHAR,
    Param_Age OUT INTEGER
)
AS
BEGIN
      SELECT Customer_ID , FirstName, LastName, Age
      INTO Param_CustomerID, Param_FirstName,  Param_LastName, Param_Age
      from  Customer WHERE Customer_ID = Param_CustomerID;
END;

/* Get All Customers */
CREATE OR REPLACE PROCEDURE GetCustomers(cursorParam OUT SYS_REFCURSOR)
 IS
  BEGIN
   OPEN cursorParam FOR
    SELECT * from Customer;
END ;


/* Get All Orders */
CREATE OR REPLACE PROCEDURE GetOrders(cursorParam OUT SYS_REFCURSOR)
 IS
  BEGIN
   OPEN cursorParam FOR
    SELECT * from Orders;
END;

CREATE OR REPLACE PROCEDURE GetOrderDetail
(
    Param_OrderId IN OUT INTEGER,
    Param_FirstName OUT VARCHAR,
    Param_LastName OUT VARCHAR,
    Param_Status OUT VARCHAR,
    Param_DepartureDate OUT VARCHAR,
    Param_ArrivalDate OUT VARCHAR,
    Param_InvoiceId OUT Integer
)
AS
BEGIN
      SELECT Order_ID, FirstName, LastName, Name, DepartureDate, ArrivalDate, Invoice_ID
      INTO Param_OrderId, Param_FirstName, Param_LastName, Param_Status, Param_DepartureDate, Param_ArrivalDate, Param_InvoiceId
      FROM Orders INNER JOIN Customer ON Orders.customer_id = customer.customer_id
      INNER JOIN Status ON orders.status_id = status.status_id
      WHERE Orders.Order_ID = Param_OrderId;
END;

/* Get Order Departure */
CREATE OR REPLACE PROCEDURE GetOrderDeparture
(
    Param_OrderId IN INTEGER,
    Param_City OUT VARCHAR,
    Param_State OUT VARCHAR
)
AS
BEGIN
      SELECT City, State
      INTO Param_City, Param_State
      FROM Location INNER JOIN Orders ON Orders.departure_id = location.location_id
      WHERE Orders.Order_ID = Param_OrderId;
END;

/* Get Order Arrival */
CREATE OR REPLACE PROCEDURE GetOrderArrival
(
    Param_OrderId IN INTEGER,
    Param_City OUT VARCHAR,
    Param_State OUT VARCHAR
)
AS
BEGIN
      SELECT City, State
      INTO Param_City, Param_State
      FROM Location INNER JOIN Orders ON Orders.arrival_id = location.location_id
      WHERE Orders.Order_ID = Param_OrderId;
END;

/* Get Invoice */
CREATE OR REPLACE PROCEDURE GetInvoice
(
    Param_InvoiceId IN INTEGER,
    Param_BillTo OUT VARCHAR,
    Param_Locked OUT Number,
    Param_Total OUT Integer
)
AS
BEGIN
      SELECT BillTo, ISLocked, Total
      INTO Param_BillTo, Param_Locked, Param_Total
      FROM Invoice
      WHERE Invoice.Invoice_ID = Param_InvoiceId;
END;

/* Get Book Detail */
CREATE OR REPLACE PROCEDURE GetBookDetail
(
    cursorParam OUT SYS_REFCURSOR,
    Param_OrderId IN INTEGER
)
 IS
  BEGIN
   OPEN cursorParam FOR
      SELECT B.Book_ID, BookType.Name, B.Departure_ID, B.Arrival_ID, B.DepartureDate, B.ArrivalDate
      FROM Orders INNER JOIN (
        Select Order_ID, Book_Id FROM OrderedBooks
      ) OB ON ob.Order_ID = orders.order_id
      INNER JOIN Book B ON b.book_id = OB.Book_Id
      INNER JOIN BookType ON booktype.booktype_id = b.booktype_id
      WHERE ob.order_id = Param_OrderId;
END;

CREATE OR REPLACE PROCEDURE GetOrderDetailByCustomer
(
    Param_CustomerId IN INTEGER,
    cursorParam OUT SYS_REFCURSOR
)
 IS
  BEGIN
   OPEN cursorParam FOR
      SELECT Order_ID, Status.Name, Orders.departure_ID, Orders.arrival_ID, DepartureDate, ArrivalDate, Invoice_ID
      FROM Orders INNER JOIN Customer ON Orders.customer_id = customer.customer_id
      INNER JOIN Status ON orders.status_id = status.status_id
      WHERE Customer.Customer_ID = Param_CustomerId;
END;

CREATE OR REPLACE PROCEDURE GetInvoiceByOrderId
(
    Param_OrderId IN INTEGER,
    Param_InvoiceId OUT INTEGER,
    Param_BillTo OUT VARCHAR,
    Param_Locked OUT VARCHAR,
    Param_Total OUT Integer
)
AS
BEGIN
      SELECT Invoice.Invoice_ID, BillTo, IsLocked, Total
      INTO Param_InvoiceId, Param_BillTo, Param_Locked, Param_Total
      FROM Invoice INNER JOIN ORDERS ON ORDERS.Invoice_ID = Invoice.Invoice_ID
      WHERE ORDERS.Order_ID = Param_OrderId;
END;

/* Get Customer By Order Id */
CREATE OR REPLACE PROCEDURE GetCustomerByOrderId
(
    Param_OrderID IN INTEGER,
    Param_CustomerID OUT INTEGER,
    Param_FirstName OUT VARCHAR,
    Param_LastName OUT VARCHAR,
    Param_Age OUT INTEGER
)
AS
BEGIN
      SELECT Customer.Customer_ID , FirstName, LastName, Age
      INTO Param_CustomerID, Param_FirstName,  Param_LastName, Param_Age
      from  Customer INNER JOIN ORDERS ON ORDERS.CUSTOMER_ID = Customer.CUSTOMER_ID
      WHERE ORDERS.Order_ID = Param_OrderID;
END;

/* Add Invoice */
CREATE OR REPLACE PROCEDURE AddInvoice
(
    Param_BillTo IN VARCHAR,
    Param_Locked IN Number,
    Param_Total IN FLOAT,
    Param_InvoiceID OUT Integer
)
AS
BEGIN
    INSERT INTO Invoice (BillTo, LOCKED, TOTAL) VALUES (Param_BillTo, Param_Locked, Param_Total)
    returning INVOICE_ID into Param_InvoiceID;
END;

/* Update Order Invoice */
CREATE OR REPLACE PROCEDURE UpdateOrderInvoice
(
    Param_OrderId IN Integer,
    Param_InvoiceId IN Integer
)
AS
BEGIN
    Update Orders
    SET orders.invoice_id = Param_InvoiceId, orders.status_id = (SELECT Status_ID FROM Status WHERE Name = 'RECIEVED')
    WHERE orders.order_id = Param_OrderId;
END;

CREATE OR REPLACE PROCEDURE UpdateOrderStatusConfirmed
(
    Param_OrderId IN Integer
)
AS
BEGIN
    Update Orders
    SET orders.status_id = (SELECT Status_ID FROM Status WHERE Name = 'CONFIRMED')
    WHERE orders.order_id = Param_OrderId;
END;

CREATE OR REPLACE PROCEDURE UpdateOrderStatusCancelled
(
    Param_OrderId IN Integer
)
AS
BEGIN
    Update Orders
    SET orders.status_id = (SELECT Status_ID FROM Status WHERE Name = 'CANCELLED')
    WHERE orders.order_id = Param_OrderId;
END;

CREATE OR REPLACE PROCEDURE UpdateInvoiceLocked
(
    Param_InvoiceId IN Integer
)
AS
BEGIN
    Update Invoice
    SET islocked = 1
    WHERE invoice.invoice_id = Param_InvoiceId;
END;

create or replace PROCEDURE GetAuditDetail
(
    cursorParam OUT SYS_REFCURSOR,
    Param_OrderId IN INTEGER
)
 IS
  BEGIN
   OPEN cursorParam FOR
      SELECT *
      FROM ordersaudit
      WHERE order_id = Param_OrderId;
END;

CREATE OR REPLACE PROCEDURE GetOrdersByMonth(
 
     Param_StartDate IN varchar,
     Param_EndDate IN varchar,
     cursorParam OUT SYS_REFCURSOR
)
 IS
  BEGIN
   OPEN cursorParam FOR
   SELECT * FROM ORDERS 
    WHERE DEPARTUREDATE > Param_StartDate AND departuredate < Param_EndDate;
END;

CREATE OR REPLACE PROCEDURE GetMonthlyInvoiceTotalByStatus(
 
     Param_Start IN varchar,
     Param_End IN varchar,    
     Param_Status IN Integer,
     Param_Total OUT FLOAT
)
 IS
  BEGIN
    SELECT SUM(Total)
    INTO Param_Total
    FROM Invoice Inner Join
    (SELECT ORDER_ID ,
        CUSTOMER_ID ,
        INVOICE_ID ,
        DEPARTURE_ID ,
        ARRIVAL_ID ,
        STATUS_ID ,
        DEPARTUREDATE ,
        ARRIVALDATE  
    FROM ORDERS
    WHERE DEPARTUREDATE > Param_Start AND DEPARTUREDATE < Param_End AND Status_ID = Param_Status) OD ON Invoice.Invoice_ID = OD.Invoice_Id;
END;

/* Delete Order */
CREATE OR REPLACE PROCEDURE DeleteOrder
(
    Param_OrderId IN Integer
)
AS
BEGIN
    FOR book_id IN (
            SELECT BOOK_ID FROM OrderedBooks
            WHERE OrderedBooks.order_id = Param_OrderId
    )
    LOOP
        DELETE FROM BOOK
        WHERE book.book_id = book_id;
    END LOOP;
    
    Delete FROM Orders
    WHERE Orders.order_id = Param_OrderId;
    
    Delete FROM OrderedBooks
    WHERE OrderedBooks.order_id = Param_OrderId;
END;