This is a basic game engine showing how to integrate a [ThreeJS](https://github.com/mrdoob/three.js/) WebGL scene loaded from a [Collada](http://en.wikipedia.org/wiki/COLLADA) (.dae) file. The environment has robust collision detection and physics thanks to the [Ammo.js](https://github.com/kripken/ammo.js) physics engine, a port of the C++ Bullet engine. The goal of this project is to create an efficient late-90s era first-person 3D game engine the user can walk around in.

Don't forget to do `git submodule update --init` to initialize the submodule if you clone this branch.

The Collada files were exported from Google SketchUp. The original .skp files are located in `models/sketchup`. Note: At
the moment this importer does not support .dae files exported from a SketchUp document that has groups. You must explode
your groups before exporting.

The COLLADA meshes are loaded into the physics engine by iterating over every face in the COLLADA document and creating a non-movable triangular mesh rigid body. The standard `THREE.ColladaLoader` parses the COLLADA XML, although it should be noted that it does not fully support all of COLLADA's features yet.

![Map from SketchUp file](https://img.skitch.com/20120404-eprjfyk87jfdpjj1kem2rqtqwp.png)
![Map rendered with WebGL](https://img.skitch.com/20120404-kw2pb5p99578e4hqa1nq294uga.png)

All files excluding those in the `lib/` directory are licensed under the MIT License.

    Copyright (C) 2012 Jay Phillips

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
    documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of
    the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
    OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
