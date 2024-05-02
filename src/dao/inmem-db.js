

//
// Onze lokale 'in memory database'.
// We simuleren een asynchrone database met een array van objecten.
// De array bevat een aantal dummy records.
// De database heeft twee methoden: get en add.
// Opdracht: Voeg de overige methoden toe.
//
const database = {
    // het array met dummy records. Dit is de 'database'.
    _data: [
        {
            id: 0,
            firstName: 'Hendrik',
            lastName: 'van Dam',
            emailAddress: 'hvd@server.nl'
            // Hier de overige velden uit het functioneel ontwerp
        },
        {
            id: 1,
            firstName: 'Marieke',
            lastName: 'Jansen',
            emailAddress: 'm@server.nl'
            // Hier de overige velden uit het functioneel ontwerp
        }
    ],

    // Ieder nieuw item in db krijgt 'autoincrement' index.
    // Je moet die wel zelf toevoegen aan ieder nieuw item.
    _index: 2,
    _delayTime: 1000,

    getAll(callback) {
        // Simuleer een asynchrone operatie
        setTimeout(() => {
            // Roep de callback aan, en retourneer de data
            callback(null, this._data)
        }, this._delayTime)
    },

    getById(id, callback) {
        // Check if callback is a function
        if (typeof callback !== 'function') {
            throw new Error('Callback is not a function');
        }

        // Simulate an asynchronous operation
        setTimeout(() => {
            // Find the user with the given ID
            console.log("Searching for user with ID:", id);

            const idNumber = parseInt(id);
            const user = this._data.find(user => user.id === idNumber);
            console.log("Retrieved user:", user);

            if (!user) {
                // If user is not found, return an error
                callback({ message: `Error: User with id ${id} does not exist!` }, null);
            } else {
                // If user is found, return the user data
                callback(null, user);
            }
        }, this._delayTime);
    },


    add(item, callback) {
        // Simulate an asynchronous operation
        setTimeout(() => {
            const emailAddressNew = item.emailAdress; // Correctly assign emailAdress
            const userExists = this._data.find(user => user.emailAddress === emailAddressNew);

            if (userExists) {
                // If a user with the same email address already exists, return an error message
                callback({ message: `Error: User with that email already exists!` }, null);
            } else {
                // If the user does not exist, add it to the database
                item.id = this._index++;
                this._data.push(item);
                // Return success message
                callback(null, item);
            }
        }, this._delayTime);
    }
    ,
    delete(id, callback) {
        // Simulate an asynchronous operation
        setTimeout(() => {
            const idNumber = parseInt(id);
            const index = this._data.findIndex(item => item.id === idNumber);

            if (index !== -1) {
                this._data.splice(index, 1);

                callback(null, { message: `User with id ${id} deleted successfully.` });
            } else {

                callback({ message: `Error: User with id ${id} not found.` }, null);
            }
        }, this._delayTime);
    },
    update(id, user, callback) {
        // Simulate an asynchronous operation
        setTimeout(() => {
            const idNumber = parseInt(id);
            const index = this._data.findIndex(item => item.id === idNumber);

            if (index !== -1) {
                // Update the user object only if it exists in the database
                this._data[index] = { ...this._data[index], ...user }; // Merge properties of user object with existing user
                callback(null, { message: `User with id ${id} updated successfully.` });
            } else {
                callback({ message: `Error: User with id ${id} not found.` }, null);
            }
        }, this._delayTime);
    }

}

module.exports = database
// module.exports = database.index;
