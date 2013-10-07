'use strict';

module.exports = function(grunt) {
    //
    grunt.registerTask("throttle", "Builds a loader builder script jit", function(delay){
        var done = this.async();
        setTimeout(function(){
            done();
        },delay?delay:100);
    });
    grunt.registerTask("loader_builder", "Builds a loader builder script jit", function(task_file, task, args_n, args_nn, args_nnn){
        var done = this.async();
        var options = grunt.file.readJSON(task_file);
        grunt.config.init(options);
        grunt.config.set(task, options[task]);
        var build_cmd = this.nameArgs;
        build_cmd = build_cmd.substring("loader_builder:".length);
        build_cmd = build_cmd.substring((task_file+":").length);
        grunt.task.run(build_cmd);
        done();
    });
    grunt.registerMultiTask("phantomizer-finalizer", "Finalizer task helper", function(){


        var ph_libutil = require("phantomizer-libutil");
        var meta_factory = ph_libutil.meta;

        //-
        var options = this.options({
            "copy":{}
            ,"meta_merge":{}
            ,"file_merge":{}
        });
        grunt.verbose.writeflags(options, 'Options');

        var copy        = options.copy;
        var file_merge  = options.file_merge;
        var meta_merge  = options.meta_merge;
        var meta_dir    = options.meta_dir;

        var meta_manager = new meta_factory( process.cwd(), meta_dir );

        for(var out_file in file_merge ){
            var in_files = file_merge[out_file];
            var content = "";
            for( var n in in_files ){
                content += grunt.file.read(in_files[n]);
                grunt.log.ok("Merged\n\t", in_files[n]);
            }
            grunt.log.ok("Merged to\n\t"+out_file);
            grunt.file.write(out_file, content);
        }
        for(var out_file in copy ){
            var in_file = copy[out_file];
            grunt.log.ok("Copied from\n\t"+in_file);
            grunt.log.ok("Copied to\n\t"+out_file);
            grunt.file.copy(in_file, out_file);
        }

        for(var out_file in meta_merge ){
            var in_files = meta_merge[out_file];
            var meta_merged = meta_manager.create([]);
            for( var n in in_files ){
                var meta_obj = meta_manager.load(in_files[n]);

                for( var task_name in meta_obj["tasks_opts"] ){
                    if( meta_merged.has_task(task_name) == false ){
                        meta_merged.require_task(task_name, meta_obj["tasks_opts"][task_name])
                    }
                }
                meta_merged.load_dependencies(meta_obj["dependences"]);
                grunt.log.ok("Meta Merged\n\t"+in_files[n]);
            }
            grunt.log.ok("Done\n\t"+out_file);
            meta_merged.save(meta_dir+out_file);
            grunt.file.write(meta_dir+out_file, JSON.stringify(meta_merged, null, 4));
        }

        grunt.log.ok()

    });
};