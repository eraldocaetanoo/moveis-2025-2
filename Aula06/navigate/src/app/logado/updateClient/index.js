import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import api from '../../../../services/api';
import { useRoute } from '@react-navigation/native';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export default function UpdateCliente() {
   const [nome, setNome] = useState('');
   const [email, setEmail] = useState(''); 
   const [password, setPassword] = useState('');
   const [endereco, setEndereco] = useState('');
   const [id, setId] = useState(null);
   const route = useRoute();
   const params = route.params;
   const navigation = useNavigation();
   const isFocused = useIsFocused();

useEffect(() => {
     console.log('ID do cliente para editar:', params);
     
    if (params && params.id) {
       
        // Buscar os dados do cliente pelo ID e preencher os campos
        api.get(`/clientes/${params.id}`).then(response => {
            const clienteData = response.data;
            setNome(clienteData.name);
            setEmail(clienteData.email);
            setPassword(clienteData.password);
            setEndereco(clienteData.endereco);
            setId(clienteData.id);
        }).catch(error => {
            Alert.alert('Erro', 'Não foi possível carregar os dados do cliente.');
            console.error(error);
        });
        alert('Editando cliente com ID: ' + params.id);
      }
      }, [isFocused]); // Effect runs when 'count' changes

  async function handleSave() {

    const body = {
      name: nome,
      email: email,
      password: password ,
      endereco: endereco 
    };  

    const salvar = await api.put(`/clientes/${id}`, body).then(response => {
      Alert.alert('Sucesso', 'Cliente criado com sucesso!');
      navigation.navigate("cliente/index");
      console.log(response.data);
    }).catch(error => {
      Alert.alert('Erro', 'Não foi possível criar o cliente.');
      console.error(error);
    });
  
  
    // pegar os dados, enviar pro backend

  }    
  return (

    <View style={styles.container}>
      <Text style={styles.text_email}  >Nome:</Text>
      <TextInput style={styles.input} value={nome} placeholder="Nome" onChangeText={(e)=>setNome(e)} />
      <Text style={styles.text_email}>Email:</Text>
      <TextInput style={styles.input} value={email} placeholder="Email" onChangeText={(e)=>setEmail(e)} />
       <Text style={styles.text_email}>Senha:</Text>
      <TextInput style={styles.input} value={password} placeholder="Senha" secureTextEntry={true}  onChangeText={(e)=>setPassword(e)} />
      <Text style={styles.text_email}>Endereco:</Text>
      <TextInput style={styles.input} value={endereco} placeholder="Endereço" onChangeText={(e)=>setEndereco(e)} />


      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSave()}
      >   
      <Text>Salvar</Text> 
      </TouchableOpacity>  
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginTop: 20  },
  input: {
    height: 40,
    borderColor: 'gray',  
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    width: '80%',
  },  
  text_email: {
    height: 40,
    marginBottom: -20,
    width: '80%',
  }, 
  button:{
     alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  }
});
