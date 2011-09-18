## ax-rq Render Queue

For starters both producers and consumers are in this one demo, although
the interface exported by Kue allows for deletion of jobs.

    # if not yet created...
    vmc push ax-rq
    # 5-add redis - ax-rq-redis
    
    # to push an update
    vmc update ax-rq
  