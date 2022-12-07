import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from "@/views/Login";
import SignUp from "@/views/SignUp";
import Product from "@/views/Product";
import Category from "@/views/Category";
import Variant from "@/views/Variant";
import User from "@/views/User";
import Cart from "@/views/Cart";
import SingleOrder from "@/views/SingleOrder";
import Order from "@/views/Order";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp
  },
  {
    path: '/product',
    name: 'product',
    component: Product
  },
  {
    path: '/category',
    name: 'category',
    component: Category
  },
  {
    path: '/variant',
    name: 'variant',
    component: Variant
  },
  {
    path: '/cart',
    name: 'cart',
    component: Cart
  },{
    path: '/orders',
    name: 'orders',
    component: Order
  },
  {
    path: '/order/:ref',
    name: 'order-single',
    component: SingleOrder
  },
  {
    path: '/users',
    name: 'users',
    component: User
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
