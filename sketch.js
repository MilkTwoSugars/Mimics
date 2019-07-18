let mic;
let listeners = [];
let stars = [];
const backgroundColour = "#1a1a1a";

let started = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(backgroundColour);
    noStroke();
    noFill();
    mic = new p5.AudioIn();
    mic.start();

    setupStars();

    for (var i = 0; i < 20; i++) {
        const l = new Listener(i * 100, (i + 1) * 50);
        listeners.push(l);
    }

}

function draw() {
    background(backgroundColour)

    if (started) {
        stroke(255);
        stars.forEach(star => point(star.x, star.y, 1))

        //noStroke();
        if (mic.enabled) {
            listeners.forEach(x => x.listen());
        }
    }
}

class Listener {
    constructor(startingCount, interval) {
        this.name = startingCount;
        this.state = "Playing";
        this.counter = startingCount;
        this.interval = interval;
        this.recorder = new p5.SoundRecorder();
        this.recorder.setInput(mic);
        this.soundFile = new p5.SoundFile();
        this.bins = 16;
        this.fft = new p5.FFT(0.8, this.bins);
        this.fft.setInput(this.soundFile);
        this.x = random(50, width - 50);
        this.y = random(50, height - 50);
        this.size = random(1, 1.2)
        this.pan = map(this.x, 50, width - 50, -1, 1)
        this.speed = map(this.size, 1, 1.2, 0.5, 2);
        this.r = random(150);
        this.g = random(150);
        this.soundFile.pan(this.pan);
        this.soundFile.rate(this.speed);

        this.playtime = 0.1;
    }

    listen() {

        if (this.state === "Playing") {
            this.playtime += 0.01;
        } else {
            this.playtime -= 0.1;
        }

        if (this.playtime < 0) {
            this.playtime = 0;
        }

        if (this.state === "Recording" && this.counter % this.interval === 0) {
            this.counter++;
            this.play();
        }

        if (this.state === "Playing" && this.counter % this.interval === 0) {
            this.record();
        }

        const spectrum = this.fft.analyze();

        for (var i = 0; i < this.bins; i++) {
            stroke(255 - spectrum[i], 255 - (this.playtime * 100))
            ellipse(this.x, this.y, (spectrum[i] * this.playtime))
        }

        this.counter++;

        if (this.counter > this.interval * 1000000) {
            this.counter = 0;
        }
    }

    play() {
        this.recorder.stop();
        this.soundFile.play();
        this.state = "Playing";
    }

    record() {
        this.soundFile.stop();
        this.fft.setInput(this.soundFile);
        this.recorder.record(this.soundFile);
        this.state = "Recording";
    }
}

function mousePressed() {
    started = true;
    getAudioContext().resume()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setupStars();
  }

  function setupStars() {
    stars = [];

    for (var i = 0; i < 250; i++) {
        const star = createVector(random(width), random(height));
        stars.push(star);
    }
  }