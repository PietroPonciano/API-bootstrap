const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({
    project: 'my-api',
    status: 'running',
  });
});

module.exports = router;
