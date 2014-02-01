'use strict';

module.exports = function(grunt) {


    var ph_libutil = require("phantomizer-libutil");
    var meta_factory = ph_libutil.meta;


    // Throttle task
    // -----------------
    //
    // Helps to fix a bug where nodejs just hangs weirdly,
    // most approaching know bugs is
    // https://github.com/gruntjs/grunt-contrib-imagemin/issues/83#issuecomment-31255670
    grunt.registerTask("throttle", "Builds a loader builder script jit", function(delay){
        var done = this.async();
        setTimeout(function(){
            done();
        },delay?delay:100);
    });

    // Finalizer task
    // -----------------
    // useful to have a enqueueable task
    // for merging, copying some one to many tasks results
    grunt.registerMultiTask("phantomizer-finalizer", "Finalizer task helper", function(){

        // init default options
        var options = this.options({
            // an object of target=>src files to copy
            "copy":{}
            // an object of target=>[src,src] files to merge, as of eta of phantomizer built file
            ,"meta_merge":{}
            // an object of target=>[src,src] files to merge
            ,"file_merge":{}
        });

        grunt.verbose.writeflags(options, 'Options');


        // merge files
        // ------------
        var file_merge = options.file_merge;
        for(var out_file in file_merge ){
            var in_files = file_merge[out_file];
            // iterate thru files to merge and append content from one to another
            var content = "";
            for( var n in in_files ){
                content += grunt.file.read(in_files[n]);
                grunt.log.ok("Merged\n\t", in_files[n]);
            }
            grunt.log.ok("Merged to\n\t"+out_file);
            grunt.file.write(out_file, content);
        }

        // copy files
        // ------------
        var copy = options.copy;
        for(var out_file in copy ){
            var in_file = copy[out_file];
            grunt.log.ok("Copied from\n\t"+in_file);
            grunt.log.ok("Copied to\n\t"+out_file);
            grunt.file.copy(in_file, out_file);
        }

        // merge files as meta
        // ------------
        // it copies all dependencies,
        // then copy all required tasks
        var meta_manager = new meta_factory( process.cwd(), options.meta_dir );
        var meta_merge = options.meta_merge;
        for(var out_file in meta_merge ){
            // create a new meta object
            var meta_merged = meta_manager.create([]);
            // iterate the sources meta to merge all together
            var in_files = meta_merge[out_file];
            for( var n in in_files ){
                // load the meta object to merge
                var meta_obj = meta_manager.load(in_files[n]);
                // for each of its tasks
                for( var task_name in meta_obj["tasks_opts"] ){
                    // merge it into the target meta
                    if( meta_merged.has_task(task_name) == false ){
                        meta_merged.require_task(task_name, meta_obj["tasks_opts"][task_name])
                    }
                }
                // attach dependencies to the target meta
                meta_merged.load_dependencies(meta_obj["dependences"]);
                grunt.log.ok("Meta Merged\n\t"+in_files[n]);
            }
            // save the resulting merged meta
            grunt.log.ok("Done\n\t"+out_file);
            meta_merged.save(out_file);
        }
        // success
        grunt.log.ok()
    });
};