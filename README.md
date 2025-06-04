const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')('VOTRE_CLE_SECRETE_STRIPE');
const app = express();
const port = 3000;
const endpointSecret = 'VOTRE_SECRET_DE_WEBHOOK_STRIPE';

app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'votre_mot_de_passe',
    database: 'nom_de_votre_base'
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
        return;
    }
    console.log('Connecté à la base de données MySQL');
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, 'votre_clé_secrète', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const validateRegistration = [
    body('nom').notEmpty().withMessage('Le nom est requis.'),
    body('email').isEmail().withMessage('L\'email doit être valide.'),
    body('mot_de_passe').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
];

app.post('/api/register', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nom, email, mot_de_passe } = req.body;
    try {
        const [existingUsers] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) return res.status(409).json({ message: 'Cet email est déjà enregistré.' });
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);
        const [result] = await db.promise().query('INSERT INTO users (nom, email, mot_de_passe) VALUES (?, ?, ?)', [nom, email, hashedPassword]);
        res.status(201).json({ message: 'Utilisateur enregistré avec succès', userId: result.insertId });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
    }
});

const validateLogin = [
    body('email').isEmail().withMessage('L\'email doit être valide.'),
    body('mot_de_passe').notEmpty().withMessage('Le mot de passe est requis.'),
];

app.post('/api/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, mot_de_passe } = req.body;
    try {
        const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Identifiants incorrects.' });
        const user = users[0];
        const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!isPasswordValid) return res.status(401).json({ message: 'Identifiants incorrects.' });
        const token = jwt.sign({ userId: user.id, role: user.role }, 'votre_clé_secrète', { expiresIn: '1h' });
        res.status(200).json({ message: 'Connexion réussie.', token: token, userId: user.id, role: user.role });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion.' });
    }
});

app.get('/api/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const [users] = await db.promise().query('SELECT id, nom, email, role, date_creation FROM users');
        res.status(200).json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (req.user.userId !== userId && req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const [users] = await db.promise().query('SELECT id, nom, email, role, date_creation FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur.' });
    }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (req.user.userId !== userId && req.user.role !== 'admin') return res.sendStatus(403);
    const { nom, email, mot_de_passe } = req.body;
    try {
        let query = 'UPDATE users SET nom = ?, email = ?';
        const params = [nom, email];
        if (mot_de_passe) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);
            query += ', mot_de_passe = ?';
            params.push(hashedPassword);
        }
        query += ' WHERE id = ?';
        params.push(userId);
        const [result] = await db.promise().query(query, params);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        res.status(200).json({ message: 'Informations de l\'utilisateur mises à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur.' });
    }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const userId = parseInt(req.params.id);
    try {
        const [result] = await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.' });
    }
});

app.get('/api/courses', async (req, res) => {
    const { q, prixMin, prixMax } = req.query;
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];
    if (q) {
        query += ' AND titre LIKE ? OR description LIKE ?';
        params.push(`%${q}%`, `%${q}%`);
    }
    if (prixMin) {
        query += ' AND prix >= ?';
        params.push(parseFloat(prixMin));
    }
    if (prixMax) {
        query += ' AND prix <= ?';
        params.push(parseFloat(prixMax));
    }
    try {
        const [courses] = await db.promise().query(query, params);
        res.status(200).json(courses);
    } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des cours.' });
    }
});

app.get('/api/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    try {
        const [courses] = await db.promise().query('SELECT * FROM courses WHERE id = ?', [courseId]);
        if (courses.length === 0) return res.status(404).json({ message: 'Cours non trouvé.' });
        res.status(200).json(courses[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération du cours:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du cours.' });
    }
});

app.post('/api/courses', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { titre, description, prix } = req.body;
    try {
        const [result] = await db.promise().query('INSERT INTO courses (titre, description, prix, auteur_id) VALUES (?, ?, ?, ?)', [titre, description, prix, req.user.userId]);
        res.status(201).json({ message: 'Cours créé avec succès.', courseId: result.insertId });
    } catch (error) {
        console.error('Erreur lors de la création du cours:', error);
        res.status(500).json({ message: 'Erreur lors de la création du cours.' });
    }
});

app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { courseId } = req.body;
    try {
        const [courses] = await db.promise().query('SELECT titre, prix FROM courses WHERE id = ?', [courseId]);
        if (courses.length === 0) return res.status(404).json({ message: 'Cours non trouvé.' });
        const course = courses[0];
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency: 'eur', unit_amount: Math.round(course.prix * 100), product_data: { name: course.titre } }, quantity: 1 }],
            mode: 'payment',
            success_url: 'http://votre-frontend.com/succes?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://votre-frontend.com/echec',
            customer_email: req.user.email,
            client_reference_id: req.user.userId + '-' + courseId,
        });
        await db.promise().query('INSERT INTO payments (user_id, course_id, amount, status, payment_intent_id) VALUES (?, ?, ?, ?, ?)', [req.user.userId, courseId, course.prix, 'pending', session.id]);
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Erreur lors de la création de la session de paiement Stripe:', error);
        res.status(500).json({ message: 'Erreur lors de la création du paiement.' });
    }
});

app.post('/webhook-paiement', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification error: ${err.message}`);
        return res.sendStatus(400);
    }
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const [userIdCourseId] = session.client_reference_id.split('-');
        const userId = parseInt(userIdCourseId);
        const courseId = parseInt(userIdCourseId.split('-')[1]);
        const paymentIntentId = session.payment_intent;
        try {
            await db.promise().query('UPDATE payments SET status = ?, transaction_id = ? WHERE payment_intent_id = ?', ['succeeded', paymentIntentId, session.id]);
            const [existingEnrollment] = await db.promise().query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
            if (existingEnrollment.length === 0) await db.promise().query('INSERT INTO enrollments (user_id, course_id, date_inscription, statut) VALUES (?, ?, NOW(), ?)', [userId, courseId, 'active']);
            console.log(`Paiement réussi pour l'utilisateur ${userId} et le cours ${courseId}`);
        } catch (error) {
            console.error('Erreur lors du traitement du webhook de paiement:', error);
        }
    }
    res.sendStatus(200);
});

app.post('/api/enrollments', authenticateToken, async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.userId;
    try {
        const [existingEnrollment] = await db.promise().query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        if (existingEnrollment.length > 0) return res.status(409).json({ message: 'Vous êtes déjà inscrit à ce cours.' });
        const [result] = await db.promise().query('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, courseId]);
        res.status(201).json({ message: 'Inscription au cours réussie.', enrollmentId: result.insertId });
    } catch (error) {
        console.error('Erreur lors de l\'inscription au cours:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription au cours.' });
    }
});

app.get('/api/users/:userId/courses', authenticateToken, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (req.user.userId !== userId && req.user.role !== 'admin') return res.sendStatus(403);
    try {
        const [courses] = await db.promise().query(`
            SELECT c.id, c.titre, c.description, c.prix
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.user_id = ?
        `, [userId]);
        res.status(200).json(courses);
    } catch (error) {
        console.error('Erreur lors de la récupération des cours de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des cours de l\'utilisateur.' });
    }
});

app.get('/api/courses/:courseId/lessons', async (req, res) => {
    const courseId = req.params.courseId;
    try {
        const [lessons] = await db.promise().query('SELECT id, titre, contenu, ordre FROM lessons WHERE course_id = ? ORDER BY ordre ASC', [courseId]);
        res.status(200).json(lessons);
    } catch (error) {
        console.error('Erreur lors de la récupération des leçons du cours:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des leçons du cours.' });
    }
});

app.post('/api/courses/:courseId/lessons', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const courseId = req.params.courseId;
    const { titre, contenu, ordre } = req.body
    
