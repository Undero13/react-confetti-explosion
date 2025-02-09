import { jsx } from 'react/jsx-runtime';
import * as React from 'react';
import range from 'lodash/range';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';
import round from 'lodash/round';
import isEqual from 'lodash/isEqual';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

var mapRange = function (value, x1, y1, x2, y2) {
    return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
};
var rotate = function (degree, amount) {
    var result = degree + amount;
    return result > 360 ? result - 360 : result;
};
var coinFlip = function () { return Math.random() > 0.5; };
// avoid this for circles, as it will have no visual effect
var zAxisRotation = [0, 0, 1];
var rotationTransforms = [
    // dual axis rotations (a bit more realistic)
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 1],
    // single axis rotations (a bit dumber)
    [1, 0, 0],
    [0, 1, 0],
    zAxisRotation,
];
var shouldBeCircle = function (rotationIndex) {
    return !isEqual(rotationTransforms[rotationIndex], zAxisRotation) && coinFlip();
};

var ROTATION_SPEED_MIN = 200; // minimum possible duration of single particle full rotation
var ROTATION_SPEED_MAX = 800; // maximum possible duration of single particle full rotation
var CRAZY_PARTICLES_FREQUENCY = 0.1; // 0-1 frequency of crazy curvy unpredictable particles
var CRAZY_PARTICLE_CRAZINESS = 0.25; // 0-1 how crazy these crazy particles are
var BEZIER_MEDIAN = 0.5; // utility for mid-point bezier curves, to ensure smooth motion paths
var rotationKeyframes = rotationTransforms.reduce(function (acc, xyz, i) {
    var _a;
    return __assign(__assign({}, acc), (_a = {}, _a["@keyframes rotation-".concat(i)] = {
        '50%': {
            transform: "rotate3d(".concat(xyz.map(function (v) { return v / 2; }).join(), ", 180deg)"),
        },
        '100%': {
            transform: "rotate3d(".concat(xyz.join(), ", 360deg)"),
        },
    }, _a));
}, {});
var confettiKeyframes = function (degrees, height, width) {
    var y = typeof height === 'string' ? height : "".concat(height, "px");
    var xLandingPoints = degrees.reduce(function (acc, degree, i) {
        var _a;
        var landingPoint = mapRange(Math.abs(rotate(degree, 90) - 180), 0, 180, -width / 2, width / 2);
        return __assign(__assign({}, acc), (_a = {}, _a["@keyframes x-axis-".concat(i)] = {
            to: {
                transform: "translateX(".concat(landingPoint, "px)"),
            },
        }, _a));
    }, {});
    return __assign({ '@keyframes y-axis': {
            to: {
                transform: "translateY(".concat(y, ")"),
            },
        } }, xLandingPoints);
};
var confettoStyle = function (particle, duration, force, size, i) {
    var _a;
    var rotation = Math.round(Math.random() * (ROTATION_SPEED_MAX - ROTATION_SPEED_MIN) + ROTATION_SPEED_MIN);
    var rotationIndex = Math.round(Math.random() * (rotationTransforms.length - 1));
    var durationChaos = duration - Math.round(Math.random() * 1000);
    var shouldBeCrazy = Math.random() < CRAZY_PARTICLES_FREQUENCY;
    var isCircle = shouldBeCircle(rotationIndex);
    // x-axis disturbance, roughly the distance the particle will initially deviate from its target
    var x1 = shouldBeCrazy ? round(Math.random() * CRAZY_PARTICLE_CRAZINESS, 2) : 0;
    var x2 = x1 * -1;
    var x3 = x1;
    // x-axis arc of explosion, so 90deg and 270deg particles have curve of 1, 0deg and 180deg have 0
    var x4 = round(Math.abs(mapRange(Math.abs(rotate(particle.degree, 90) - 180), 0, 180, -1, 1)), 4);
    // roughly how fast particle reaches end of its explosion curve
    var y1 = round(Math.random() * BEZIER_MEDIAN, 4);
    // roughly maps to the distance particle goes before reaching free-fall
    var y2 = round(Math.random() * force * (coinFlip() ? 1 : -1), 4);
    // roughly how soon the particle transitions from explosion to free-fall
    var y3 = BEZIER_MEDIAN;
    // roughly the ease of free-fall
    var y4 = round(Math.max(mapRange(Math.abs(particle.degree - 180), 0, 180, force, -force), 0), 4);
    return _a = {},
        _a["&#confetti-particle-".concat(i)] = {
            animation: "$x-axis-".concat(i, " ").concat(durationChaos, "ms forwards cubic-bezier(").concat(x1, ", ").concat(x2, ", ").concat(x3, ", ").concat(x4, ")"),
            '& > div': {
                width: isCircle ? size : Math.round(Math.random() * 4) + size / 2,
                height: isCircle ? size : Math.round(Math.random() * 2) + size,
                animation: "$y-axis ".concat(durationChaos, "ms forwards cubic-bezier(").concat(y1, ", ").concat(y2, ", ").concat(y3, ", ").concat(y4, ")"),
                '&:after': __assign({ backgroundColor: particle.color, animation: "$rotation-".concat(rotationIndex, " ").concat(rotation, "ms infinite linear") }, (isCircle ? { borderRadius: '50%' } : {})),
            },
        },
        _a;
};
var useStyles = function (_a) {
    var particles = _a.particles, duration = _a.duration, height = _a.height, width = _a.width, force = _a.force, particleSize = _a.particleSize;
    var confettiStyles = particles.reduce(function (acc, particle, i) { return (__assign(__assign({}, acc), confettoStyle(particle, duration, force, particleSize, i))); }, {});
    return createUseStyles(__assign(__assign(__assign({}, rotationKeyframes), confettiKeyframes(particles.map(function (particle) { return particle.degree; }), height, width)), { container: {
            width: 0,
            height: 0,
            position: 'relative',
        }, screen: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
        }, particle: __assign(__assign({}, confettiStyles), { '& > div': {
                position: 'absolute',
                left: 0,
                top: 0,
                '&:after': {
                    content: "''",
                    display: 'block',
                    width: '100%',
                    height: '100%',
                },
            } }) }), { name: 'confetti-explosion' });
};

var FORCE = 0.5; // 0-1 roughly the vertical force at which particles initially explode
var SIZE = 12; // max height for particle rectangles, diameter for particle circles
var HEIGHT = '120vh'; // distance particles will fall from initial explosion point
var WIDTH = 1000; // horizontal spread of particles in pixels
var PARTICLE_COUNT = 100;
var DURATION = 2200;
var COLORS = ['#FFC700', '#FF0000', '#2E3191', '#41BBC7'];
var createParticles = function (count, colors) {
    var increment = 360 / count;
    return range(count).map(function (index) { return ({
        color: colors[index % colors.length],
        degree: increment * index,
    }); });
};
function ConfettiExplosion(_a) {
    var _b = _a.particleCount, particleCount = _b === void 0 ? PARTICLE_COUNT : _b, _c = _a.duration, duration = _c === void 0 ? DURATION : _c, _d = _a.colors, colors = _d === void 0 ? COLORS : _d, _e = _a.particleSize, particleSize = _e === void 0 ? SIZE : _e, _f = _a.force, force = _f === void 0 ? FORCE : _f, _g = _a.height, height = _g === void 0 ? HEIGHT : _g, _h = _a.width, width = _h === void 0 ? WIDTH : _h, zIndex = _a.zIndex, onComplete = _a.onComplete, props = __rest(_a, ["particleCount", "duration", "colors", "particleSize", "force", "height", "width", "zIndex", "onComplete"]);
    var _j = React.useState(), origin = _j[0], setOrigin = _j[1];
    var particles = createParticles(particleCount, colors);
    var classes = useStyles({
        particles: particles,
        duration: duration,
        particleSize: particleSize,
        force: force,
        width: width,
        height: height,
    })();
    var originRef = React.useCallback(function (node) {
        if (node) {
            var _a = node.getBoundingClientRect(), top_1 = _a.top, left = _a.left;
            setOrigin({ top: top_1, left: left });
        }
    }, []);
    React.useEffect(function () {
        if (typeof onComplete === 'function') {
            var timeout_1 = setTimeout(onComplete, duration);
            return function () { return clearTimeout(timeout_1); };
        }
    }, [duration, onComplete]);
    return (jsx("div", __assign({ ref: originRef, className: classes.container }, props, { children: origin &&
            createPortal(jsx("div", __assign({ className: classes.screen }, (zIndex ? { style: { zIndex: zIndex } } : null), { children: jsx("div", __assign({ style: { position: 'absolute', top: origin.top, left: origin.left } }, { children: particles.map(function (particle, i) { return (jsx("div", __assign({ id: "confetti-particle-".concat(i), className: classes.particle }, { children: jsx("div", {}) }), particle.degree)); }) })) })), document.body) })));
}

export { ConfettiExplosion as default };
//# sourceMappingURL=index.esm.js.map
