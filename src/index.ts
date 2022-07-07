import express from 'express';

const PORT = process.env.PORT || 8080;

const app = express();

app.get('/', (req, res) => {
    res.json({ message: `hello ${req.ip}` });
});

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
