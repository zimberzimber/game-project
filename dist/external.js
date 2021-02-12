// The reason for these being 'external' pieces is that you won't have to recompile the entire project if you change some basic things around.

var configuration = {
    debug: true, // Some options are exposed while in debug.
    logLevel: 0, // Logging level. 0: Debug, 1: Info, 2: Warn, 3: Error, 4: None
    debugDraw: false, // Draw debug objects such as collision polygons?
};

// The other asset definitions are part of the compiled code because they need strict definitions, and changing them will usually require changing whatever uses them.
const baseUrl = 'http://127.0.0.1:3001';
var assets = {
    images: {
        // Image name : URL
        sprites: `${baseUrl}/content/sprites.png`,
        ui_elements: `${baseUrl}/content/uiElements.png`,
        water: `${baseUrl}/content/water.png`,
        title: `${baseUrl}/content/title.png`,
        splash_ori: `${baseUrl}/content/splash_ori.png`,
        splash_ku: `${baseUrl}/content/splash_ku.png`,
        colors: `${baseUrl}/content/colors.png`,
        bg_00: `${baseUrl}/content/bg_00.png`,
        fbg_00: `${baseUrl}/content/fbg_00.png`,
        fg_00: `${baseUrl}/content/fg_00.png`,
        ffg_00: `${baseUrl}/content/ffg_00.png`,
        enemies: `${baseUrl}/content/enemies.png`,
        spiders: `${baseUrl}/content/spiders.png`,
        particles: `${baseUrl}/content/particles.png`,
        sword_swing: `${baseUrl}/content/sword_swing.png`,
        hammer_swing: `${baseUrl}/content/hammer_swing.png`,
        hp_gauge: `${baseUrl}/content/life.png`,
        energy_gauge: `${baseUrl}/content/energy.png`,
        resource_container: `${baseUrl}/content/resource_container.png`,
        shockwave: `${baseUrl}/content/shockwave.png`,
    },

    audio: {
        // Audio name : URL
        silence: `${baseUrl}/audio/silence.mp3`,

        // SFX
        item_key: `${baseUrl}/audio/sfx/item_key.mp3`,
        ui_accept: `${baseUrl}/audio/sfx/ui_accept.mp3`,
        ui_tick: `${baseUrl}/audio/sfx/ui_tick.mp3`,
        bow_shot: `${baseUrl}/audio/sfx/bow_shot.mp3`,

        // Music
        music_game: `${baseUrl}/audio/music/game.mp3`,
        music_main: `${baseUrl}/audio/music/main.mp3`,

        // Impulse
        impulse_cathedral: `${baseUrl}/audio/impulse/impulse_cathedral.wav`,
    }
}