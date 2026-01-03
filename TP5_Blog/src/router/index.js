import {createRouter, createWebHistory} from 'vue-router';
import Home from '@/views/HomeView.vue';
import CreatePostView from '@/views/CreatePostView.vue';
import PostDetails from '@/views/PostDetailView.vue';
import HomeView from '@/views/HomeView.vue';

const routes = [
    {path: '/', name: 'HomeView', component : HomeView},
    {path: '/add-post', name: 'CreatePost', component : CreatePostView},
    {path: '/post/:id', name: 'PostDetails', component : PostDetails, props: true},
    {path: '/tags/:tag', name: 'TagFiltered', component : Home, props: true},
]

export default createRouter({
    history: createWebHistory(),
    routes,
})
