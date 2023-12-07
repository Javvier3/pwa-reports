class Camera{
    constructor(node){
        this.node = node;
    }

    powerOn(){
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {width: 300, height: 300}
        }).then((stream) =>{
            this.node.srcObject = stream;
            this.stream = stream;
        })
    }

    powerOff(){
        this.node.pause();
        if(this.stream){
            this.stream.getTracks()[0].stop();
        }
    }

    takeAPhoto(){
        //Crear un elemento canvas para renderizar la foto
        let canvas = document.createElement("canvas");

        //Colocar las dimensiones igual al elemento del video
        canvas.setAttribute("width", 300);
        canvas.setAttribute("height", 300);

        //Obtener el contexto del canvas
        let context = canvas.getContext("2d"); //contexto 2d

        //Dibujar la imagen dentro del canvas
        context.drawImage(this.node, 0, 0, canvas.width, canvas.height);

        this.photo = context.canvas.toDataURL();

        //Limpiar la imagen
        canvas = null;
        context = null;

        return this.photo;

    }
}