exports = module.exports;
exports.consume = consume;

// process site rendering jobs, 1 at a time.
function consume (jobs) {
    function convertFrame(i, fn) {
        setTimeout(fn, 1000);
    }
    
    jobs.process('render site', 1, function(job, done){
        var pages = job.data.pages;

        //console.log('done',done);

        function next(i) {
            //console.log('next',i,job.created_at,job.updated_at);
            convertFrame(i, function(err){
                if (err) return done(err);
                job.progress(i, pages);
                //looks like progress and done do not save/update the persisted version
                // so duration and updated_at are not ok in redis.
                job.save();
                if (i >= pages) {
                    done();
                } else {
                    next(i + 1);
                }
            });
        }
        next(0);
    });
}
