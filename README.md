This is a basic demo showing how to integrate a [ThreeJS](https://github.com/mrdoob/three.js/) WebGL scene loaded from a [Collada](http://en.wikipedia.org/wiki/COLLADA) (.dae) file with the [jiglibjs2](https://github.com/bartdeboer/JigLibJS2) physics engine. The physics engine is used for collision detection and falling physics. The goal of this project is to create an efficient first-person 3D environment the user can walk around in.

There is also a branch showing how to do this with [Ammo.js](https://github.com/kripken/ammo.js/) using [Physijs](https://github.com/chandlerprall/Physijs) located [here](https://github.com/jicksta/threejs-collada-physics/tree/physijs). At the moment the Physijs branch has no-clipping player movement.

The Collada files were exported from Google Sketchup. The original .skp files are located in `models/sketchup`. Note: At
the moment this importer does not support .dae files exported from a Sketchup document that has groups. You must explode
your groups before exporting.

*Note: You will notice that the collision detection and movement experiences are inadequate. This is partially due to the physics engines, partially how the physics engine is setup, and partially how slow JavaScript is. I will use this project as a way of developing the best microframework for navigating a 3D world. If you have ideas for how this can be improved, feel free to send me a message on Github.*

The COLLADA meshes are loaded into the physics engine by iterating over every face in the COLLADA document and creating a non-movable triangular mesh rigid body. The standard `THREE.ColladaLoader` parses the COLLADA XML, although it should be noted that it does not fully support all of COLLADA's features yet.

![building.skp Sketchup file](https://img.skitch.com/20120330-84191a9e41kdqkjufymwupb8xs.png)
![building.dae in WebGL](https://img.skitch.com/20120330-dr71et6cedhpb11e9akbrdhify.png)

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
