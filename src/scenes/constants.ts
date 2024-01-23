const createLabel = (scene, text) => {
    return scene.rexUI.add.label({
        width: 40, // Minimum width of round-rectangle
        height: 40, // Minimum height of round-rectangle

        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

        text: scene.add.text(0, 0, text, {
            fontSize: '24px'
        }),
        name: text,
        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
};

export function getDialog(scene: Phaser.Scene) {

    let x = window.innerWidth / 2 - 270;
    let y = 600;
    const dialog = scene.rexUI.add.dialog({
        x: x,
        y: y,
        width: 500,

        background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 'gray'),

        title: createLabel(scene, 'Title').setDraggable(),

        toolbar: [
            // createLabel(scene, 'O'),
            createLabel(scene, 'X')
        ],

        leftToolbar: [
            // createLabel(scene, 'A'),
            // createLabel(scene, 'B')
        ],

        content: createLabel(scene, 'Content'),

        // description: createLabel(scene, 'Description'),

        choices: [
            // createLabel(scene, 'Choice0'),
            createLabel(scene, 'Choice1'),
            createLabel(scene, 'Choice2')
        ],

        actions: [
            createLabel(scene, 'Action0'),
            createLabel(scene, 'Action1')
        ],

        space: {
            left: 20,
            right: 20,
            top: -20,
            bottom: -20,

            title: 25,
            titleLeft: 30,
            content: 25,
            description: 25,
            descriptionLeft: 20,
            descriptionRight: 20,
            choices: 25,

            toolbarItem: 5,
            choice: 15,
            action: 15,
        },

        expand: {
            title: false,
            // content: false,
            // description: false,
            // choices: false,
            // actions: true,
        },

        align: {
            title: 'center',
            // content: 'left',
            // description: 'left',
            // choices: 'left',
            actions: 'right', // 'center'|'left'|'right'
        },

        click: {
            mode: 'release'
        }
    })
        .setDraggable('background')   // Draggable-background
        .layout()
        // .drawBounds(scene.add.graphics(), 0xff0000)
        // .popUp(1000)
        .hide()
        .setDepth(1)

    scene.print = scene.add.text(0, 0, '').setDepth(2)
    dialog
        .on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle();
        });

    return dialog;
}