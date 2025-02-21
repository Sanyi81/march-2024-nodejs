const express = require("express");
const app = express();
const {read, write} = require("./fs.service");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users', async (req, res) => {
    try {
        const users = await read();
        res.send(users)
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.post('/users', async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if (!name || name.length < 3) {
            return res.status(400).send("Name cannot be empty");
        }
        if (!email || !email.includes('@')) {
            return res.status(400).send("Email cannot be empty");
        }
        if (!password || password.length < 6) {
            return res.status(400).send("Password cannot be empty");
        }
        const users = await read();

        const id = users.length ? users[users.length - 1]?.id + 1 : 1;
        const newUser = {id, name, email, password};
        users.push(newUser);

        await write(users);
        res.status(201).send(newUser);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.get('/users/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const users = await read();
        const user = users.find(user => user.id === userId);
        if (!user) {
            return res.status(404).send('User Not Found');
        }
        res.send(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.put('/users/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const {name, email, password} = req.body;

        if (!name || name.length < 3) {
            return res.status(400).send("Name cannot be empty");
        }
        if (!email || !email.includes('@')) {
            return res.status(400).send("Email cannot be empty");
        }
        if (!password || password.length < 6) {
            return res.status(400).send("Password cannot be empty");
        }
        const users = await read();

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).send('User Not Found');
        }
        users[userIndex].name = name;
        users[userIndex].email = email;
        users[userIndex].password = password;

        await write(users);
        res.status(201).send(users[userIndex]);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const users = await read();

        const userIndex = users.findIndex(user => user.id === userId);
        if (userIndex === -1) {
            return res.status(404).send('User Not Found');
        }
        users.splice(userIndex, 1);

        await write(users);
        res.sendStatus(204);
    } catch (e) {
        res.status(500).send(e.message);
    }
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
})