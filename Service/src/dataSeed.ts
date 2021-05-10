import random from 'random';
import { Order, Customer, Location, Status, Book, BookType, OrderLite, Invoice } from './interfaces';
import { uniqueNamesGenerator, names } from 'unique-names-generator';
import { addHours } from 'date-fns'
interface USLocation {
    state: string,
    city: string,
    code: string
}

const locations: USLocation[] = [
    { state: 'Alabama', city: 'Montgomery', code: 'MGM'}, 
    { state: 'Alaska', city: 'Juneau', code: 'MTM' },
    { state: 'Arizona', city: 'Phoenix', code: 'AZA' },
    { state: 'Arkansas', city: 'Little Rock', code: 'LIT'},
    { state: 'California', city: 'Sacramento', code: 'SMF'},
    { state: 'Colorado', city: 'Denver', code: 'DEN'},
    { state: 'Connecticut', city: 'Hartford', code: ''},
    { state: 'Delaware', city: 'Dover', code: ''},
    { state: 'Florida', city: 'Tallahassee', code: ''},
    { state: 'Georgia', city: 'Atlanta', code: ''}, 
    { state: 'Hawaii', city: 'Honolulu', code: ''}, 
    { state: 'Idaho', city: 'Boise', code: ''}, 
    { state: 'Illinois', city: 'Springfield', code: ''}, 
    { state: 'Indiana', city: 'Indianapolis', code: ''},
    { state: 'Iowa', city: 'Des Moines', code: ''},
    { state: 'Kansas', city: 'Topeka', code: ''}, 
    { state: 'Kentucky', city: 'Frankfort', code: ''}, 
    { state: 'Louisiana', city: 'Baton Rouge', code: ''},
    { state: 'Maine', city: 'Augusta', code: ''},
    { state: 'Maryland', city: 'Annapolis', code: ''},
    { state: 'Massachusetts', city: 'Boston', code: ''}, 
    { state: 'Michigan', city: 'Lansing', code: ''}, 
    { state: 'Minnesota', city: 'Saint Paul', code: 'MSP'}, 
    { state: 'Mississippi', city: 'Jackson', code: ''}, 
    { state: 'Missouri', city: 'Jefferson City', code: ''},
    { state: 'Montana', city: 'Helana', code: ''}, 
    { state: 'Nebraska', city: 'Lincoln', code: ''}, 
    { state: 'Nevada', city: 'Carson City', code: ''},
    { state: 'New Hampshire', city: 'Concord', code: ''},
    { state: 'New Jersey', city: 'Trenton', code: ''},
    { state: 'New Mexico', city: 'Santa Fe', code: ''}, 
    { state: 'New York', city: 'Albany', code: ''}, 
    { state: 'North Carolina', city: 'Raleigh', code: ''}, 
    { state: 'North Dakota', city: 'Bismarck', code: ''}, 
    { state: 'Ohio', city: 'Columbus', code: ''}, 
    { state: 'Oklahoma', city: 'Oklahoma City', code: ''}, 
    { state: 'Oregon', city: 'Salem', code: ''},
    { state: 'Pennsylvania', city: 'Harrisburg', code: ''},
    { state: 'Rhode Island', city: 'Providence', code: ''}, 
    { state: 'South Carolina', city: 'Columbia', code: ''},
    { state: 'South Dakota', city: 'Pierre', code: ''}, 
    { state: 'Tennessee', city: 'Nashville', code: ''},
    { state: 'Texas', city: 'Austin', code: ''}, 
    { state: 'Utah', city: 'Salt Lake City', code: ''}, 
    { state: 'Vermont', city: 'Montpelier', code: ''},
    { state: 'Virginia', city: 'Richmond', code: ''}, 
    { state: 'Washington', city: 'Olympia', code: ''},
    { state: 'West Virginia', city: 'Charleston', code: ''},
    { state: 'Wisconsin', city: 'Madison', code: ''}, 
    { state: 'Wyoming', city: 'Cheyenne', code: ''}];
const countries: string[] = ['USA'];

export const createOrder = () => {
    const departureLocation = createLocation();
    const arrivalLocation = createLocation();
    const departureDate = new Date(2021, random.int(0, 12), random.int(0, 31)).toLocaleString()
    const arrivalDate = addHours(new Date(departureDate), random.int(10, 14)).toLocaleString()
    const newOrder = { 
        customer: createCustomer(),
        departure: departureLocation,
        arrival: arrivalLocation,
        departureDate: departureDate,
        arrivalDate: arrivalDate,
        status: Status.Pending,
        books: createBooks(random.int(1, 3), departureLocation, arrivalLocation, departureDate, arrivalDate)
    } as Order

    return newOrder;
}

export const createOrderLite = () => {
    return {
        orderId: random.int(0, 100),
        customerId: random.int(0, 100),
        invoiceId: random.int(-1, 2),
        statusId: getRandomStatus(),
        departureId: random.int(0, 100),
        arrivalId: random.int(0, 100),
        arrivalDate: new Date().toLocaleString(),
        departureDate: new Date().toLocaleString()
    } as OrderLite
}

export const createCustomer = (): Customer => {
    const newCustomer = {
        customerId: random.int(10, 100),
        firstName: uniqueNamesGenerator({ dictionaries: [ names ] }),
        lastName: uniqueNamesGenerator({ dictionaries: [ names ] }),
        age: random.int(21, 120)
    } as Customer

    return newCustomer;
} 

export const createBooks = (numberOfBooks: number, startLocation: Location, endLocation: Location, startDate: string, endDate: string): Book[] => {
    const bookType: BookType = getRandomBookType()
    const newBooks: Book[] = []
    let count = 0;
    while(count < numberOfBooks) {
        const previousDate = newBooks.length === 0 ? startDate : newBooks[count - 1].arrivalDate
        const newBook = {
            bookType: bookType,
            departure: count === 0 ? startLocation : newBooks[count - 1].arrival,
            arrival: count + 1 === numberOfBooks ? endLocation: createLocation(),
            departureDate: !previousDate ? startDate : previousDate,
            arrivalDate: count + 1 === numberOfBooks ? endDate : addHours(new Date(Date.parse(previousDate)), random.int(1, 6)).toLocaleString()
        } as Book

        newBooks.push(newBook)
        count++;
    }

    return newBooks;
} 

export const createLocation = (): Location => {
    const randomInt = random.int(0, locations.length -1);
    const newLocation = { 
        code: locations[randomInt].code,
        city: locations[randomInt].city,
        state: locations[randomInt].state,
        country: countries[0],
    } as Location

    return newLocation;
}

export const createInvoice = (customer: Customer): Invoice => {
    const randomPrice = randomIntFromInterval(50, 2000).toFixed(2)
    const newInvoice = { 
        total: +randomPrice,
        billTo: `${customer.firstName} ${customer.lastName}`,
        locked: 0
    } as Invoice

    return newInvoice;
}

const getRandomBookType = (): BookType => {
    const number = random.int(1, 3)
    switch(number)
    {
        case 1: return BookType['Car Rental'];
        case 2: return BookType.Flight
        case 3: return BookType.Rail;
        case 4: return BookType.Shuttle
    }
}

const getRandomStatus = (): Status => {
    const number = random.int(1, 3)
    switch(number)
    {
        case 1: return Status.Confirmed;
        case 2: return Status['Pending Payment']
        case 3: return Status.Pending;
        case 4: return Status.Recieved
    }
}

function randomIntFromInterval(min: number, max: number) { 
    return Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min);
  }