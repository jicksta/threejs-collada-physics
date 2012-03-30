This is a basic demo showing how to integrate a [ThreeJS](https://github.com/mrdoob/three.js/) WebGL scene loaded from a [Collada](http://en.wikipedia.org/wiki/COLLADA) (.dae) file with the [jiglibjs2](https://github.com/bartdeboer/JigLibJS2) physics engine.

This demo could serve as the basis for a 3D game.

The `demo.html` code simply loads a specified .dae file, adds it into the scene and the physics engine, then creates cubes
which fall onto the scene to test their collisions. ThreeJS first person controls are also setup allowing you to fly
around with the WSAD keys and the mouse.

There is also a branch showing how to do this with [Ammo.js](https://github.com/kripken/ammo.js/) using [Physijs](https://github.com/chandlerprall/Physijs) located [here](https://github.com/jicksta/threejs-collada-physics/tree/physijs).

The Collada files were exported from Google Sketchup. The original .skp files are located in `models/sketchup`. Note: At
the moment this importer does not support .dae files exported from a Sketchup file that has groups. You must explode
your groups before exporting.

![building.skp Sketchup file](https://img.skitch.com/20120330-84191a9e41kdqkjufymwupb8xs.png)
![building.dae in WebGL](https://img.skitch.com/20120330-dr71et6cedhpb11e9akbrdhify.png)

The `demo.html` file and all files in `models/` are licensed under the MIT License.

    Copyright (C) 2012 Jay Phillips

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
    documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
    WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
    OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
