/**
*
*/
<template>
  <div class="page">
    <toolbar :title="$t(title)" :showbackicon="false" ref="toolbar">
      <v-btn icon @click.native="showAccounts" slot="left-tool">
        <i class="material-icons">repeat</i>
      </v-btn>

      <!--<v-btn icon slot='right-tool' @click="pickershow()" v-if="islogin">-->
      <!--<i class="material-icons">&#xE145;</i>-->
      <!--</v-btn>-->
      <!--<v-btn icon slot='left-tool' @click="toThirdApps">-->
      <!--<i class="material-icons">apps</i>-->
      <!--</v-btn>-->


      <v-btn icon slot='right-tool' @click="addTrust">
        <i class="material-icons">&#xE145;</i>
      </v-btn>
      <span slot="switch_password">{{$t('Account.Password')}}</span>
    </toolbar>

    <accounts-nav :show="showaccountsview" @close="closeView"/>

    <div class="accountandtotalasset">
      <scroll :refresh="reload">
        <div class="accountnameaddress"><!-- 试着改动的地方wdp-->
          <div class="flex-row">
            <div class="flex2 textcenter">
              <div class="avatar-wrapper">
                <span class="avatar-back" @click="toNameCard"><i class="iconfont icon-erweima avatar"></i></span>
              </div>
            </div>
            <div class="flex4">
              <div class="title">{{account.name}}</div>
              <div class="address">{{account.address | shortaddress}}</div>
            </div>
          </div>
        </div>
        <!--<div id="TotalSum" class="myassets_totalSum" >-->
          <!--<span class="myassets_TotalSumWord" >{{$t('TotalAssets')}}≈</span>-->
          <!--<span>{{TotalSum.toFixed(2)}}</span>&lt;!&ndash; 要改成资产数组数据的累加的和&ndash;&gt;-->
          <!--<span>CNY</span>-->
        <!--</div>-->
      </scroll>
    </div>

    <div class="flex-row">
      <!--<div class="flex2">&nbsp;</div>-->
      <!--<div class="flex1">-->
        <!--<v-btn depressed flat color="primary" @click="hiddenMyAssets">-->
          <!--<span class="no-upper">{{is_Flag === 'filter_zero'? $t('ShowZeroAsset'): $t('HideZeroAsset')}}</span>-->
        <!--</v-btn>-->
      <!--</div>-->
      <!--<div class="flex1">-->
        <!--<v-menu offset-y>-->
          <!--<v-btn depressed flat color="primary" slot="activator">-->
            <!--<span class="no-upper">{{$t(selectedSortItem.label)}}</span>-->
          <!--</v-btn>-->
          <!--<v-list>-->
            <!--<v-list-tile v-for="item in sortItems" :key="item.key">-->
              <!--<v-list-tile-title @click="chgSortItem(item)">{{ $t(item.label) }}</v-list-tile-title>-->
            <!--</v-list-tile>-->
          <!--</v-list>-->
        <!--</v-menu>-->
      <!--</div>-->
    </div>

    <scroll :refresh="refresh">

      <div class="content">
        <card padding="0px 0px" margin="0px 0px" class="myassets_infocard_thirdassets full-width">
          <div class="assets full-width" slot="card-content">
            <div class="assets-row" v-for="(item,index) in assets" :key="item.issuer+item.code"
                 v-touch="{
                left: () => selectedItem = index,
                right: () => selectedItem = null
              }"
            >
              <v-layout v-if="item.code != 'FTN'" class="myassets-li third-li" row wrap v-swiper=2.2 @click.stop="toAsset(item)">
                <v-flex xs2 class="myassets-wrapper">
                  <div class="icon-wrapper">
                    <!--<i :class="'iconfont ' + assetIcon(item.code,item.issuer)"></i>-->
                    <img src="../../assets/img/icon.png" class="logo" />
                  </div>
                </v-flex>
                <v-flex xs3 class="myassets-wrapper">
                  <div class="myassets">
                    <div class="myassets-name">{{item.code}}</div>
                    <div class="myassets-issuer" v-if="assethosts[item.issuer]">{{assethosts[item.issuer] }}</div>
                    <!--<div class="myassets-issuer" v-else>{{item.issuer | miniaddress}}</div>-->
                  </div>
                </v-flex>
                <v-flex xs7 class="myassets-wrapper">
                  <div class="myassets-balance third">
                    <span class="balance">{{item.balanceStr}}</span>
                    <span class="label">{{$t('Total')}}</span>
                    <br/>
                    <!--<span v-if="item.total >=0">≈{{item.total > 0 ? item.total : 0}}&nbsp;&nbsp;CNY</span>-->
                  </div>
                </v-flex>
              </v-layout>
              <div class="myassets-operate-box">
                <div class="del" @click.stop="del(item)">{{$t('Delete')}}</div>
                <div class="send" @click.stop="send(item)">{{$t('Send')}}</div>
                <div class="receive" @click.stop="receive(item)">{{$t('Receive')}}</div>
              </div>
            </div>
          </div>
        </card>
      </div>

    </scroll>

    <!--
      <tab-bar />
       -->

    <bottom-notice :show.sync="notice" :text="noticeText">    </bottom-notice>
    <loading :show="working" :loading="working" :success="delok" :fail='delerror' />
    <password-sheet v-if="needpwd" @cancel="cancelpwd" @ok="checkpwd" />
  </div>

</template>

<script>
  import Toolbar from '@/components/Toolbar'
  import { mapState, mapActions, mapGetters} from 'vuex'
  import Card from '@/components/Card'
  import BottomNotice from '@/components/BottomNotice'
  import AccountsNav from '@/components/AccountsNav'
  import  { miniAddress } from '@/api/account'
  import { isNativeAsset } from '@/api/assets'
  import { COINS_ICON, FF_ICON, DEFAULT_ICON, WORD_ICON} from '@/api/gateways'
  import Loading from '@/components/Loading'
  import backbutton from '@/mixins/backbutton'
  import loadaccount from '@/mixins/loadaccount'
  import Scroll from '@/components/Scroll'
  import TabBar from '@/components/TabBar'
  import  defaultsDeep  from 'lodash/defaultsDeep'
  import { getAssetPrice } from '@/api/fchain'
  import { Decimal } from 'decimal.js'
  import throttle from 'lodash/throttle'
  import {SET_PRICE_BY_API} from '@/store/modules/AppSettingStore'
  import { xdrMsg,getXdrResultCode } from '@/api/xdr'
  import { federation } from '@/api/federation'
  //过滤0资产
  const FLAG_FILTER_ZERO = "filter_zero";
  //不过滤资产
  const FLAG_DEFAULT = "none";
  //按名称排序
  const SORT_NAME = "name";
  const SORT_BANLANCE = "balance";
  const SORT_DEFAULT = "none";

  export default {
    data(){
      return {
        title: 'Title.MyAssets',
        showbackicon: false,
        showmenuicon: true,
        noticeText: '',
        notice: false,

        working:false,
        delok: false,
        delerror: false,

        needpwd: false,
        is_Flag: FLAG_DEFAULT,
        sort_flag: SORT_BANLANCE,
        price:[],

        _getPriceFn: null,

        selectedItem: null,

        showaccountsview: false,

        sortItems: [{
          key: SORT_DEFAULT,
          label: 'DefaultSort'
        },{
          key: SORT_NAME,
          label: 'SortByName'
        },{
          key: SORT_BANLANCE,
          label: 'SortByAsset'
        }],
        selectedSortItem:{key: SORT_BANLANCE,
          label: 'SortByAsset'}
      }
    },
    mixins: [backbutton, loadaccount],
    computed:{
      ...mapState({
        priceState: state => state.app.price,
      }),
      /**
       * 尝试修改的资产总和
       */
      TotalSum() {
        let pricemap = this.prices
        let data = this.balances.map(item=>{
          let v = isNativeAsset(item) ? pricemap['FTN'] : pricemap[item.code + '-' + item.issuer]
          return v ? new Decimal(v.price || 0).times(item.balance) : new Decimal(0)
        })
        if(data.length === 0)return 0
        return data.reduce((t,i)=> t.add(i ? i : 0))
      },
      ...mapState({
        account: state => state.accounts.selectedAccount,
        account: state => state.accounts.selectedAccount,
        accountData: state => state.accounts.accountData,
        islogin: state => (state.accounts.accountData.seed ? true : false),
        assethosts: state => state.asset.assethosts,
        notfunding: state => state.account.account_not_funding
      }),
      ...mapGetters(["balances", "paymentsRecords", "reserve",'base_reserve', "native"]),
      prices(){
        let obj = {}
        this.price.forEach(item=>{
          if(isNativeAsset(item)){
            obj[item.code] = Object.assign({}, item)
          }else{
            obj[item.code+'-'+item.issuer] = Object.assign({}, item)
          }
        })
        return obj;
      },
      assets() {
        if (!this.balances) return [];
        let data = this.balances
          .map(item => {
            return defaultsDeep({}, item, { price: 0 }); // new Decimal(item.balance).times(1).toFixed(7) })
          })
          .filter(item => {
            if (this.is_Flag === FLAG_FILTER_ZERO) {
              return item.balance > 0;
            } else {
              return true;
            }
          });
        //按照名称排序或者是按照资产排序,默认直接返回。
        if (this.sort_flag != SORT_DEFAULT) {
          data = data.sort((item1, item2) => {
            if (this.sort_flag === SORT_NAME) {
              return item1.code > item2.code ? 1 : -1;
            } else if (this.sort_flag === SORT_BANLANCE) {
              return item2.balance - item1.balance;
            }
          });
        }
        //添加价格
        data.forEach(item=>{

          if(item.balance > 0){
            let key = item.code
            if(!isNativeAsset(item)) {
              key += '-' + item.issuer
            }
            let p = this.prices[key]
            if(p){
              item.price = p.price
              item.total = new Decimal(p.price || 0).times(item.balance).toNumber();
              if(item.total >0){
                item.total = item.total.toFixed(2)
              }
            }

          }else{
            item.total = 0
          }
        })
        return data.map(item=> {
          item.balanceStr = item.balance > 0 ? item.origin_balance: 0
          return item
        })
      },
      showAccounts(){
        this.showaccountsview = true
      },
      closeView(){
        this.showaccountsview = false
      }
    },
    watch: {
      sort_flag(){
        this.selectedItem = null
      },
      balances(){
        if(this._getPriceFn){
          this._getPriceFn()
        }
      }
    },
    beforeMount () {
      this.price = this.priceState
    },
    mounted() {
      this._getPriceFn = throttle(()=>{
        getAssetPrice(this.balances.filter(item=> Number(item.balance)>0).map(item=> {
          return {code: item.code, issuer:item.issuer }
        }))
          .then(response => {
            this.price = response.data;
            this.$store.commit(SET_PRICE_BY_API, response.data)
          }).catch(err => {});
      },60000)

      this.$nextTick(() => {

        // TODO 优化
        // setTimeout(() => {
        //   if (this.notfunding) {
        //     this.noticeText = this.$t("Error.AccountNotFund");
        //     this.notice = true;
        //   }
        // }, 3000);

      });


      // this.addTrust({code:"LINK", issuer: "GCLJ4CBNWR4SOOPZM66W7XFMP62ZDIKBBEWBWEIP7TCA3NM2NVORWV2O"})
      // {
      //   console.log('adding trust-------------------------------')
      // }
    },
    methods: {
      ...mapActions([
        'getAccountInfo',
        'cleanAccount',
        'updateAccount',
      ]),
      ...mapActions({
        trust: 'trust',
        trustAll: 'trustAll',
        // delTrust: 'delTrust',
      }),

      reload(){
        return this.getAccountInfo(this.account.address)
      },
      updateFederationAndInflationInfo() {
        // update home_domain and inflation_destination from horizon.
        console.log("updateFederationAndInflationInfo")
        console.log(this.accountData)
        if (this.account.federationAddress !== this.accountData.inflation_destination || this.account.inflationAddress !== this.accountData.home_domain) {
          let data = Object.assign({}, this.account, {
            federationAddress: this.accountData.home_domain,
            inflationAddress: this.accountData.inflation_destination
          })
          console.log(this.accountdata.home_domain)
          let params = {index: this.selectedAccountIndex, account: data}
          console.log(params)
          this.updateAccount(params)
            .then(data => {
              console.log("success")
            })
            .catch(err => {
              console.log("failed")
              console.error(err)
            })
        }
      },
      /*
       *
       * 尝试修改的我不同的资产转换为xcn时的值
      */
      myassetstoxcn: function(mybalance) {
        let data = 0;
        for (var i = 0; i < this.balances.length; i++) {
          for (var j = 0; j < this.price.length; j++) {
            if (
              this.price[j].code === this.balances[i].code &&
              this.price[j].issuer === this.balances[i].issuer &&
              mybalance != 0
            ) {
              data = Number(this.price[j].price) * mybalance;
              return data;
            }
          }
        }
      },
      toNameCard() {
        this.$router.push({name: 'AccountNameCard'})
      },
      //隐藏资产---------------------------------------------------------------
      hiddenMyAssets() {
        this.is_Flag =
          this.is_Flag === FLAG_FILTER_ZERO ? FLAG_DEFAULT : FLAG_FILTER_ZERO;
        this.selectedItem = null
      },
      ...mapActions({
        selectAsset:'selectAsset',
        delTrust:'delTrust',
      }),
      toAddAsset(){
        //跳转到授权菜单
        this.$router.push({name:'AddAsset'})
      },
      toAsset(item){
        this.selectAsset(item)
        this.$router.push({name:'Asset'})
      },
      // 发送资产
      send(item){
        if(!this.islogin){
          this.$toasted.error(this.$t('Error.NoPassword'))
          this.$refs.toolbar.showPasswordLogin()
          return
        }
        this.selectAsset(item)
        this.$router.push({name: 'SendAsset'})
      },
      // 接收资产
      receive(item){
        this.selectAsset(item)
        this.$router.push({name: 'ReceiveAsset'})
      },
      // 删除授信
      del(item){
        if(!this.islogin){
          this.$toasted.error(this.$t('Error.NoPassword'))
          this.$refs.toolbar.showPasswordLogin()
          return
        }
        if(this.working)return
        if(Number(item.balance) > 0){
          this.$toasted.error(this.$t('Error.AssetNotZero'))
          return
        }
        this.working = true
        this.delTrust({
          seed: this.accountData.seed,
          address: this.account.address,
          code: item.code,
          issuer: item.issuer})
          .then(data=>{
            this.$toasted.show(this.$t('DeleteTrustSuccess'))
            this.delok = true
            this.delerror = false
            this.selectedItem = null
            setTimeout(()=>{
              this.working = false
            },1000)
            try{
              let doms = window.document.querySelectorAll('.myassets-li')
              for(var i=0,n=doms.length;i<n;i++){
                let element = doms[i]
                element.style.transition = "0.3s"
                element.style.marginLeft = 0 + "px"
              }
            }catch(error){
              console.error(error)
            }
          })
          .catch(err=>{
            this.$toasted.error(this.$t('Error.DeleteTrustError'))
            this.delok = false
            this.delerror = true
            setTimeout(()=>{
              this.working = false
            },1000)
          })
      },
      refresh(){
        return this.load()
      },
      assetIcon(code,issuer){
        return COINS_ICON[code] || WORD_ICON[code.substring(0,1)] || DEFAULT_ICON
      },
      chgSortItem(item){
        this.selectedSortItem = item;
        this.sort_flag = item.key;
      },
      toThirdApps(){
        this.$router.push({name: 'Apps'})
      },
      addTrust(){
        var currency={code: "LINK", issuer: "GCA3SBI2Y6AYHLAW2GBTS7C5HTSFW6OTZACHOVJGBQ6JENTE3ZXPNNSL"}
        console.log('in addTrust module---------------------------------------------------------')
        if(!this.accountData.seed){
          //   this.$toasted.error(this.$t('Error.NoPassword'))
          //   return;
          // }
          // if(!this.islogin){
          this.$toasted.error(this.$t('Error.NoPassword'))
          this.$refs.toolbar.showPasswordLogin()
          return
        }
        if(this.native.balance - this.reserve > this.base_reserve){
          console.log('enough native asset to continue')
        }else{
          this.$toasted.error(this.$t('Error.NotEnoughLumens'))
          return
        }
        if(this.working) return
        this.trustsuccess = false
        this.trustfail = false
        this.showloading = true
        this.working = true
        this.loadingTitle = null
        this.loadingMsg = null
        let params = {
          seed: this.accountData.seed,
          address: this.account.address,
          code: currency.code,
          issuer: currency.issuer}
        this.trust(params)
          .then(response=>{
            console.log(response)
            this.trustsuccess = true
            this.trustfail = false
            this.working = false
            this.loadingTitle = this.$t('AddAssetSuccess')
            this.asset_code = null
            this.asset_issuer = null

            setTimeout(()=>{
              this.showloading = false
            },3000)
          })
          .catch(err=>{
            console.error(err)
            this.trustsuccess = false
            this.trustfail = true
            this.working = false
            //有可能返回超时，这时候也需要处理一下
            let msg = getXdrResultCode(err)
            this.loadingTitle = this.$t('AddAssetFail')
            if(msg){
              this.loadingMsg = this.$t(msg)
            }
          })
          .finally(
            //this.working = false
          )
      },


    },
    components: {
      Toolbar,
      BottomNotice,
      Card,
      Scroll,
      TabBar,
      AccountsNav,
      'loading': Loading,
    }
  }

</script>


<style lang="stylus" scoped>
  @require '~@/stylus/asset.styl'
  @require '~@/stylus/settings.styl'
  .logo
    width: 38px
    height:38px
    margin-top :5px
</style>

