<template>
  <v-app>
    <v-main>
      <v-row>
        <v-col v-if="order != null" cols="12" sm="10" md="8" offset-sm="1" offset-md="2">
          <h3 class="mt-10 pa-5">Order No: {{order.ref}}</h3>
          <h3 class="pa-5">Status: {{order.status.text.split('').map((a,i)=>i === 0?a.toUpperCase():a).join('')}}</h3>
          <v-simple-table class="pa-5">
            <template v-slot:default>
              <thead>
              <tr>
                <th>
                  Image
                </th>
                <th>
                  Name
                </th>
                <th>
                  Price (N)
                </th>
                <th>
                  Quantity
                </th>
                <th>
                  Amount (N)
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, i) in order.items" :key="i">
                <td class="pa-3">
                  <v-avatar>
                    <img
                        :src="item.imageUrl"
                        :alt="item.title"
                    >
                  </v-avatar>
                </td>
                <td class="pa-3">{{ item.title }}</td>
                <td class="pa-3">{{ item.price.toLocaleString("en-GB") }}</td>
                <td class="pa-3">{{ item.qty }}</td>
                <td class="pa-3">{{ (item.qty * item.price).toLocaleString("en-GB") }}</td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
          <div class="text-right mt-4">
            <div>
              <h3>Total: N{{order.amount.toLocaleString('en-GB')}}</h3>
            </div>
            <v-btn color="primary" :loading="paymentLoading" v-if="order.status.value === 0" @click="makePayment">
              Make Payment
            </v-btn>
            <v-dialog
                v-model="openPaystack"
                width="500"
            >
              <v-card class="pa-5">
                <div class="text-center">
                  <paystack
                      v-if="openPaystack"
                      :amount="order.amount*100"
                      :email="$store.state.user.email"
                      :paystackkey="paystackKey"
                      :reference="genReference"
                      :callback="callback"
                      :close="close"
                      :embed="false"
                  >
                    <v-btn color="primary">Proceed to PayStack</v-btn>
                  </paystack>
                </div>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                      color="primary"
                      text
                      @click="openPaystack = false"
                  >
                    Ok
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-col>
        <v-col class="text-center" v-if="!orderFound">
          <h2>Order could not be found</h2>
        </v-col>
      </v-row>
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
import paystack from 'vue-paystack';
export default {
  name: "SingleOrder",
  components:{
    paystack
  },
  created(){
    this.getOrder();
  },
  data: ()=>({
    dialog: '',
    dialogText: '',
    snackbar:false,
    snackbarText:'',
    snackbarColor:'green',
    order: null,
    orderFound: true,
    openPaystack: false,
    reference: false,
    paystackKey: 'pk_test_46d943a78983b4b3c84305e49d45087002d79fca',
    paymentLoading: false
  }),
  methods: {
    getOrder(){
      fetch(this.$store.state.baseUrl+'order/'+this.$route.params.ref,{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        if(data.status === 200){
          this.order = data.order
          console.log(this.order);
        }else{
          this.dialog = true;
          this.snackbarText = data.message;
          this.orderFound = false;
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
        this.snackbar = true;
        this.snackbarText = err.message;
        this.orderFound = false;
      });
    },
    makePayment(){
      this.reference = this.genReference;
      this.openPaystack = true;
    },
    callback: function(response){
      this.openPaystack = false;
      this.paymentLoading = true;
      fetch(this.$store.state.baseUrl+'verify-payment/'+response.reference,{
        method: 'GET',
        headers: {
          'Authorization': this.$store.state.jwt_token
        }
      }).then(response=>{
        return response.json();
      }).then(data=>{
        console.log(data);
        this.paymentLoading = false;
        this.dialog = true;
        if(data.status === 200){
          if(data.reference.data.amount >= (this.order.amount * 100)){
            this.dialogText = 'Your payment is successful and has been verified';
            this.order.status.text = 'Paid';
            this.order.status.value = 1;
            fetch(this.$store.state.baseUrl+'order/'+this.$route.params.ref,{
              method: 'POST',
              headers: {
                'Authorization': this.$store.state.jwt_token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 1
              })
            });
          }else{
            this.dialogText = 'Insufficient amount paid';
          }
        }else{
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
        this.paymentLoading = false;
        this.dialog = true;
        this.dialogText = err.message;
      });
      // console.log(response);
      // if(response.status === 'success'){
      //   this.dialog = true;
      //   this.dialogText = 'Payment received successfully'
      // }
    },
    close: function(){
      this.openPaystack = false;
      console.log("Payment closed")
    },
  },
  computed: {
    genReference(){
      let text = "";
      let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( let i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
  }
}
</script>

<style scoped>

</style>