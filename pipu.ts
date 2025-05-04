abstract class Lapiz {

}

class lapizMecanico {

    grafos: number
    grafoActual: number | null

    constructor(grafos: number) {
        this.grafos = grafos
    }

    dibujar() {

        // Si existe un grafo cargado y su uso sea mayor a 0
        if (!this.grafoActual || this.grafoActual > 0) {
            return "No tengo un grafo cargado"
        }

        this.grafoActual = this.grafoActual - 0.1
        return "Dibuje algo"
    }

    cargarGrafo() {
        if (this.grafos > 0) {
            this.grafos -= 1
            this.grafoActual = 1

            // Se carga un grafo
        }
    }
}

const lapiz = new lapizMecanico(3)
lapiz.cargarGrafo()
lapiz.dibujar()