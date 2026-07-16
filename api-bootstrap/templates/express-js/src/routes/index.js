const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
  res.json({
    project: '{{PROJECT_NAME}}',
    status: 'running',
  });
});

module.exports = router;
