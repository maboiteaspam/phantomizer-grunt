'use strict';

module.exports = function(grunt) {
    //
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
        //-
        var options = this.options({
            "copy":{}
            ,"meta_merge":{}
        });
        grunt.verbose.writeflags(options, 'Options');
        var copy = options.copy;
        var meta_dir = options.meta_dir;
        var meta_merge = options.meta_merge;

        for(var out_file in copy ){
            var in_file = copy[out_file];
            grunt.log.ok("Copied from "+in_file);
            grunt.log.ok("Copied to "+out_file);
            grunt.file.copy(in_file, out_file);
        }

        for(var out_file in meta_merge ){
            var in_files = meta_merge[out_file];
            var meta_merged = {
                "build":[]
                ,"dependences":[]
            }
            for( var n in in_files ){
                var meta_obj = grunt.file.readJSON(meta_dir+""+in_files[n]);

                for( var t in meta_obj["build"] ){
                    meta_merged["build"].push( meta_obj["build"][t] );
                }
                for( var t in meta_obj["dependences"] ){
                    meta_merged["dependences"].push( meta_obj["dependences"][t] );
                }
            }
            grunt.log.ok("Meta Merged to "+meta_dir+out_file);
            grunt.file.write(meta_dir+out_file, JSON.stringify(meta_merged, null, 4));
        }

        grunt.log.ok()

    });
};