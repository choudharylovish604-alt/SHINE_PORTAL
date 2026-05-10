const express = require("express");
const router = express.Router();
const db = require("../db");


// CREATE NEW QUERY
router.post("/create", async (req, res) => {
    try {
        const {
            student_id,
            mentor_id,
            title,
            message,
            sender_id
        } = req.body;

        // Create query
        const queryResult = await db.query(
            `INSERT INTO chatbot_queries
            (student_id, mentor_id, title)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [student_id, mentor_id, title]
        );

        const queryId = queryResult.rows[0].id;

        // Add first message
        await db.query(
            `INSERT INTO chatbot_messages
            (query_id, sender_id, sender_role, message)
            VALUES ($1, $2, $3, $4)`,
            [queryId, sender_id, "student", message]
        );

        res.json({
            success: true,
            query: queryResult.rows[0]
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Server Error"
        });
    }
});


// GET STUDENT QUERIES
router.get("/student/:id", async (req, res) => {
    try {

        const result = await db.query(
            `SELECT *
             FROM chatbot_queries
             WHERE student_id = $1
             ORDER BY created_at DESC`,
            [req.params.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.log(err);
    }
});

// GET MENTOR QUERIES
router.get("/mentor/:id", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT cq.*, u.name as student_name
             FROM chatbot_queries cq
             JOIN students s ON cq.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE cq.mentor_id = $1
             ORDER BY cq.created_at DESC`,
            [req.params.id]
        );

        res.json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch mentor queries' });
    }
});


// GET CHAT MESSAGES
router.get("/messages/:queryId", async (req, res) => {
    try {

        const result = await db.query(
            `SELECT *
             FROM chatbot_messages
             WHERE query_id = $1
             ORDER BY created_at ASC`,
            [req.params.queryId]
        );

        res.json(result.rows);

    } catch (err) {
        console.log(err);
    }
});


// SEND REPLY
router.post("/reply", async (req, res) => {
    try {

        const {
            query_id,
            sender_id,
            sender_role,
            message
        } = req.body;

        await db.query(
            `INSERT INTO chatbot_messages
            (query_id, sender_id, sender_role, message)
            VALUES ($1, $2, $3, $4)`,
            [query_id, sender_id, sender_role, message]
        );

        // Update query status
        if (sender_role === "mentor") {

            await db.query(
                `UPDATE chatbot_queries
                 SET status='answered'
                 WHERE id=$1`,
                [query_id]
            );
        }

        res.json({
            success: true
        });

    } catch (err) {
        console.log(err);
    }
});

module.exports = router;