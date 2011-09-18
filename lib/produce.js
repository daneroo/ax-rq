
exports = module.exports;

exports.produce = produce;

function produce(jobs,isVCAP) {
  var sites = ['axialdev', 'djembe', 'estrimont', 'lepresident','daniel'];
  var site = sites[Math.random() * sites.length | 0];
  var host = ['ekomobi.com','ekomobi.ci.axialdev.net'][Math.random() * 2 | 0];
  var job = jobs.create('render site', {
      title: 'rendering ' + site + ' ('+host+') for siteify'
    , site: site
    , host: 'ekomobi.com'
    , user: 1
    , pages: 5
  });

  job.on('complete', function(){
      console.log(" Job  #" + job.id + " completed "+new Date()); //blank out rest
  }).on('failed', function(){
      console.log(" Job  #" + job.id + " failed"); //blank out rest
  }).on('progress', function(progress){
    if (isVCAP){
        // no progress output on vcap
    } else {
        //process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete\r');
        //console.log(' Job #' + job.id + ' ' + progress + '% complete');
    }
  });
  job.save();
}
