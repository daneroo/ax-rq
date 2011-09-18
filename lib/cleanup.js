// cleanup some jobs
exports = module.exports;
exports.cleanup = cleanup;

function cleanup(kue,jobs,completeJobExpiry){
    //console.log("cleaning up");
    
    if (0) jobs.card('complete',function (err,n) {
        if (err) return;
        console.log("completed tasks: "+n);
    });

    jobs.state('complete',function (err,ids) {
        if (err) return;
        (ids).forEach(function(id,index) {
            //console.log("considering task: "+id);
            kue.Job.get(id,function(err,job) {
                if (err) {
                    console.error('cleanup failed to find:',id,err);
                    return;
                }
                if (!job){
                    console.log('cleanup: !job,err',job,err);
                    return;
                }
                var updated_at = parseInt(job.updated_at, 10),
                    howOld = updated_at - Date.now(),
                    shouldDelete = ! Math.max(updated_at + completeJobExpiry - Date.now(), 0);


                if (!shouldDelete) {
                    //console.log("-not removing task: "+id,howOld/1000,'sec ago:',new Date(updated_at));
                    return;
                }
                console.log("cleanup:removing completed task: "+id,(howOld/1000)|0,'sec ago',new Date(updated_at),'dur:',job.duration);
                
                job.remove(function(err) {
                    if (err){
                        console.error('cleanup:remove failed:',id,err);
                    } else {
                        //console.log('confirmed that remove worked',id);
                    }
                })
            });
        });
    });
};