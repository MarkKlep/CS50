const express = require('express');
const { postSchema, mongoose } = require('./mongo');

const Post = mongoose.model('Post', postSchema);

const app = express();
app.use(express.json());

app.post('/post', async (req, res) => {
    const { title, content, isPublished } = req.body;

    const post = new Post({ title, content, isPublished });
    await post.save();

    res.status(201).send(post);
});

app.get('/posts', async (req, res) => {
    const posts = await Post.find();

    res.status(200).send(posts);
});

app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).send({ message: 'Post not found' });
    }

    const post = await Post.findById(id);

    if (!post) {
        res.status(404).send({ message: 'Post not found' });
    }

    res.status(200).send(post);
});

app.put('/posts/:id', async (req, res) => {
    const { id } = req.params
    const { title, content, isPublished } = req.body;

    const updPost = await Post.updateOne({ id: Number(id) }, { $set: { title, content, isPublished } });

    res.status(200).send(updPost);
});

app.listen(3000);