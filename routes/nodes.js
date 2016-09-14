var express = require('express');
var router = express.Router();
var NodesController = require('../controllers/nodes');

/*GET*/
router.get('/getAllNodes', NodesController.getAllNodes);

router.post('/test', NodesController.test);
/* POST */
router.post('/createNode', NodesController.createNode);

router.post('/setNode', NodesController.setNode);

module.exports = router;
