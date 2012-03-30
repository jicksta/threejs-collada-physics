This is a basic demo showing how to integrate a [ThreeJS](https://github.com/mrdoob/three.js/) WebGL scene loaded from a [Collada](http://en.wikipedia.org/wiki/COLLADA) (.dae) file with the [jiglibjs2](https://github.com/bartdeboer/JigLibJS2) physics engine.

This demo could serve as the basis for a 3D game.

The `demo.html` code simply loads a specified .dae file, adds it into the scene and the physics engine, then creates a cube
which falls onto the scene to test its interaction. ThreeJS first person controls are also enabled allowing you to
fly around with the WSAD keys and the mouse.

There is also a branch showing how to do this with [Ammo.js](https://github.com/kripken/ammo.js/) using [Physijs](https://github.com/chandlerprall/Physijs) located [here](https://github.com/jicksta/threejs-collada-physics/tree/physijs).

The Collada files were exported from Google Sketchup. The original .skp files are located in `models/sketchup`.

![building.skp Sketchup file](https://img.skitch.com/20120330-84191a9e41kdqkjufymwupb8xs.png)
![building.dae in WebGL](https://img.skitch.com/20120330-dr71et6cedhpb11e9akbrdhify.png)
