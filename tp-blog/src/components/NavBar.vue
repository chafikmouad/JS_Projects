<template>
    <nav>
        <router-link to="/" class="nav-item">Home</router-link>
        <router-link to="/add-post" class="nav-item">Add Post</router-link>
    </nav>
</template>

<style>
    .navbar {
        background: blue;
        gap:20px;
        margin:5px;
        display: flex;
        padding: 10px;
    }    
    .nav-item {
        color: blue;
        margin:15px;
        font-weight: bold;
        font-size: 1.5rem;
    }
</style>