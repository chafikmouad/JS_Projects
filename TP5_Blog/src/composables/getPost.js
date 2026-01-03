import { ref } from 'vue'
import getPosts from './getPosts'

export default function getPost(id) {
  const { posts } = getPosts()
  const post = ref(null)

  post.value = posts.value.find(p => p.id == id)

  return { post }
}
