const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//ROUTE01:- fetch all notes post:-/api/notes/fetchallnotes
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Notes.find({ user: req.user.id });

        res.json(notes);

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server Error.")
    }

})

//ROUTE02:- add note post:-/api/notes/addnote...login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter Valid title.').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 character.').isLength({ min: 5 }),
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tag, user: req.user.id //<--req.user is come from frtchuser.and then req.user.id
        })

        const saveNote = await note.save();

        res.json(saveNote);


    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error.")
    }


})

//ROUTE03:- update note put:-/api/notes/updatenote/:id...login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    //create new note object
    try {
        const newNotes = {};

        if (title) { newNotes.title = title };
        if (description) { newNotes.description = description };
        if (tag) { newNotes.tag = tag };

        //find note to be update
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.status(404).send("not found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNotes }, { new: true })
        res.json({ note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error.")
    }

})

//ROUTE04:- delete note Delete:-/api/notes/deletenote/:id...login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        //find note to be delete and delete it
        let note = await Notes.findById(req.params.id);

        if (!note) {
            return res.status(404).send("not found")
        }
        //Allow delete only if user own this
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("not allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "success": " note is deleted", note: note });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server Error.")
    }

})


module.exports = router