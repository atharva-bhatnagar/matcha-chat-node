const NodeCache=require('node-cache');
const emailCache=new NodeCache({stdTTL:3600});

module.exports=emailCache;