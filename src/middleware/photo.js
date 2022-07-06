const photo = (req, res, next) => {
  console.log('huii');
  if (req.post.photo.data) {
    res.set('Content-Type', req.post.photo.contentType);
    return res.send(req.post.photo.data);
  } else {
    return res.send(false);
  }
  next();
};

module.exports = photo;
