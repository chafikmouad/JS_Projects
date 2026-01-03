import { ref } from 'vue'

const posts = ref([
  {
    id: 1,
    title: 'Gestion',
    body: 'Gestion simple des posts dans une application Vue 3.',
    tags: ['intro', 'test']
  },
  {
    id: 2,
    title: 'Vue 3 Tips',
    body: 'Quelques astuces utiles pour bien démarrer avec Vue 3.',
    tags: ['vue', 'javascript']
  },
  {
    id: 3,
    title: 'Gestion des formulaires',
    body: 'Exemple simple de gestion de formulaire et validation basique.',
    tags: ['form', 'tutorial']
  },
  {
    id: 4,
    title: 'Tag cloud demo',
    body: 'Post pour tester l\'affichage et le filtrage par tags.',
    tags: ['test', 'tags']
  }
])

export default function getPosts() {
  return { posts }
}
