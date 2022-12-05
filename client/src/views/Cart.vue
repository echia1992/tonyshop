<template>
  <v-app>
    <v-main>
      <v-container v-if="carts.length > 0">
        <template>
          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3" v-for="item in carts" :key="item.id">
              <v-card
                  class="mx-auto"
                  max-width="350"
                  outlined
              >
                <v-list-item three-line>
                  <v-list-item-content>
                    <v-list-item-title class="text-h5 mb-1">
                      {{item.Product.title}}
                    </v-list-item-title>
                    <v-text-field
                        label="Quantity"
                        outlined
                        type="number"
                        dense
                        class="mt-1"
                        v-model="item.qty"
                        @change="updateCart(item.Product.slug)"
                    ></v-text-field>
                    <h4 class="mt-n3">N{{(item.Product.price * item.qty).toLocaleString('en-GB')}}</h4>
                  </v-list-item-content>
                  <v-list-item-avatar
                      tile
                      size="80"
                      color="grey"
                  >
                    <v-img :src="item.Product.imageUrl"></v-img>
                  </v-list-item-avatar>
                </v-list-item>

                <v-card-actions>
                  <v-btn
                      outlined
                      rounded
                      text
                      @click="removeFromCart(item.Product.slug)"
                  >
                    Remove
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <div class="text-right">
          <h3>Total: ₦{{getTotal.toLocaleString('en-GB')}}</h3>
          <v-btn color="primary" @click="proceedToCheckout" :loading="checkoutLoading">Checkout</v-btn>
        </div>
      </v-container>
      <v-container class="text-center" v-else>
        <h2>Cart is empty</h2>
      </v-container>
    </v-main>
    <v-dialog
        v-model="dialog"
        width="500"
    >
      <v-card class="pa-5">

        <v-card-text>
          {{ dialogText }}
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              text
              @click="dialog = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        v-model="snackbar"
        color="snackbarColor"
        centered
    >{{snackbarText}}

    </v-snackbar>
  </v-app>
</template>

<script>
export default {
  name: "Cart",
  created(){
    this.getCart();
  },
  data: ()=>({
    carts: [],
    dialog: false,
    snackbar:false,
    snackbarText:'',
    snackbarColor:'success',
    dialogText: false,
    checkoutLoading: false
  }),
  methods:{
    getCart(){
      fetch(this.$store.state.baseUrl+'cart',{
        method: 'GET',
        headers: {
          Authorization: this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.carts = data.carts
        }else{
          this.dialog = true;
          this.dialogText = data.message;
        }
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    removeFromCart(slug) {
      if (!confirm('Are you sure you want to remove this item?')) {
        return;
      }
      fetch(this.$store.state.baseUrl + 'product/' + slug + '/cart', {
        method: 'DELETE',
        headers: {
          Authorization: this.$store.state.jwt_token
        }
      }).then(response => {
        return response.json();
      }).then(data => {
        this.dialog = true;
        this.dialogText = data.message;
        if (data.status === 200) {
          this.getCart();
        }
        if (data.status === 401) {
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth', {
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if (data.status === 403) {
          this.$router.push('/');
        }
      }).catch(err => {
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    updateCart(slug){
      let cartIndex = this.carts.findIndex(cart=>{
        return cart.Product.slug === slug;
      });
      this.carts[cartIndex].qty = this.carts[cartIndex].qty < 1 ? 1 : this.carts[cartIndex].qty
      fetch(this.$store.state.baseUrl+'product/'+slug+'/cart',{
        method: 'PUT',
        headers: {
          Authorization: this.$store.state.jwt_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qty: this.carts[cartIndex].qty || 1,
          refresh: true
        })
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 401){
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth',{
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if(data.status === 403){
          this.$router.push('/');
        }
      }).catch(err=>{
        this.dialog = true;
        this.dialogText = err.message;
      });
    },
    proceedToCheckout(){
      this.checkoutLoading = true;
      fetch(this.$store.state.baseUrl+'checkout',{
        method: 'PUT',
        headers:{
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        this.checkoutLoading = false;
        if(data.status === 200){
          this.$router.push('/order/'+data.order.ref);
          return;
        }
        this.dialog = true;
        this.dialogText = data.message;
        if (data.status === 401) {
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth', {
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if (data.status === 403) {
          this.$router.push('/');
        }
      }).catch(err => {
        this.checkoutLoading = false;
        this.dialog = true;
        this.dialogText = err.message;
      });
      // this.reference = this.genReference;
      // this.openPaystack = true;
    },
    clearCart(){
      fetch(this.$store.state.baseUrl + 'cart', {
        method: 'DELETE',
        headers: {
          Authorization: this.$store.state.jwt_token
        }
      }).then(response => {
        return response.json();
      }).then(data => {
        if (data.status === 200) {
          this.carts = [];
        }
        if (data.status === 401) {
          this.$cookies.remove('jwt_token');
          this.$store.commit('setAuth', {
            token: "",
            user: {}
          });
          this.$router.push('/login');
        }
        if (data.status === 403) {
          this.$router.push('/');
        }
      }).catch(err => {
        this.snack = true;
        this.snackbarText = err.message;
      });
    }
  },
  computed:{
    getTotal(){
      let t = 0;
      this.carts.forEach(cart=>{
        t += cart.Product.price * cart.qty;
      });
      return t;
    },
  }
}
</script>

<style scoped>

</style>