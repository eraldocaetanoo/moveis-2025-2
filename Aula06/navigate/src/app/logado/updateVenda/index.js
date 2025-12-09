import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import api from "../../../../services/api";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function UpdateVenda() {
  const navigation = useNavigation();
  const route = useRoute();

  const { id } = route.params || {};

  const [loading, setLoading] = useState(true);

  const [usersList, setUsersList] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  const [produtosList, setProdutosList] = useState([]);

  const [idUser, setIdUser] = useState("");
  const [idCliente, setIdCliente] = useState("");

  const [idProduto, setIdProduto] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [precoUnitario, setPrecoUnitario] = useState("");

  const [itensVenda, setItensVenda] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (!id) {
          Alert.alert("Erro", "ID da venda não fornecido.");
          navigation.goBack();
          return;
        }

        // Carregar listas
        const [usersRes, clientesRes, produtosRes] = await Promise.all([
          api.get("/users"),
          api.get("/clientes"),
          api.get("/produtos"),
        ]);

        setUsersList(usersRes.data);
        setClientesList(clientesRes.data);
        setProdutosList(produtosRes.data);

        // 2. Carregar a VENDA atual
        const vendaRes = await api.get(`/vendas/${id}`);
        const vendaData = vendaRes.data;

        // Preencher Cabeçalho
        // Mantém o número original que veio do banco
        setIdUser(vendaData.idUser || "");
        setIdCliente(vendaData.idCliente || "");

        // Preencher Itens (Mapeamento Seguro)
        if (vendaData.ItemVendas) {
          const itensFormatados = vendaData.ItemVendas.map((item) => ({
            idProduto: item.idProduto,
            nomeProduto: item.Produto ? item.Produto.name : "Produto Carregado",
            quantidade: Number(item.quantidade),
            precoUnitario: Number(item.precoUnitario),
            // ID Único temporário para evitar chaves duplicadas
            tempId: `${Date.now()}-${Math.random()}`,
          }));
          setItensVenda(itensFormatados);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Falha ao carregar dados da venda.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function handleSelectProduto(produtoId) {
    setIdProduto(produtoId);
    const produtoSelecionado = produtosList.find((p) => p.id === produtoId);
    if (produtoSelecionado) {
      setPrecoUnitario(
        produtoSelecionado.preco ? produtoSelecionado.preco.toString() : ""
      );
    } else {
      setPrecoUnitario("");
    }
  }

  function handleAddItem() {
    if (!idProduto || !quantidade || !precoUnitario) {
      Alert.alert("Atenção", "Preencha todos os campos do item.");
      return;
    }

    const qtdParsed = parseInt(quantidade);
    const precoParsed = parseFloat(precoUnitario.toString().replace(",", "."));

    if (isNaN(qtdParsed) || isNaN(precoParsed)) {
      Alert.alert("Erro", "Quantidade ou Preço inválidos.");
      return;
    }

    const produtoRef = produtosList.find((p) => p.id === idProduto);

    const novoItem = {
      idProduto: parseInt(idProduto),
      nomeProduto: produtoRef ? produtoRef.name : "Produto",
      quantidade: qtdParsed,
      precoUnitario: precoParsed,
      tempId: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    };

    setItensVenda([...itensVenda, novoItem]);

    // Limpar campos
    setIdProduto("");
    setQuantidade("");
    setPrecoUnitario("");
    Keyboard.dismiss();
  }

  function handleRemoveItem(idParaRemover) {
    Alert.alert("Remover", "Deseja remover este item?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sim",
        style: "destructive",
        onPress: () =>
          setItensVenda((prev) =>
            prev.filter((i) => i.tempId !== idParaRemover)
          ),
      },
    ]);
  }


  async function handleUpdate() {
    if (!idUser || !idCliente) {
      Alert.alert("Erro", "Vendedor e Cliente são obrigatórios.");
      return;
    }
    if (itensVenda.length === 0) {
      Alert.alert("Erro", "A venda deve ter itens.");
      return;
    }

    const body = {
      idUser: parseInt(idUser),
      idCliente: parseInt(idCliente),
      itens: itensVenda.map((item) => ({
        idProduto: item.idProduto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      })),
    };

    try {
      await api.put(`/vendas/${id}`, body);
      Alert.alert("Sucesso", "Venda atualizada!");

      // Navegação segura para voltar
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("venda/index");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar.");
      console.error(error);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando venda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
      >
        <Text style={styles.headerTitle}>Editar Venda #{id}</Text>

        <Text style={styles.label}>Vendedor</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idUser} onValueChange={setIdUser}>
            <Picker.Item label="Selecione..." value="" color="#999" />
            {usersList.map((u) => (
              <Picker.Item key={u.id} label={u.name} value={u.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Cliente</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idCliente} onValueChange={setIdCliente}>
            <Picker.Item label="Selecione..." value="" color="#999" />
            {clientesList.map((c) => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.separator} />
        <Text style={styles.subTitle}>Itens da Venda</Text>

        {/* --- FORMULÁRIO DE ITEM --- */}
        <Text style={styles.label}>Produto</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={idProduto} onValueChange={handleSelectProduto}>
            <Picker.Item label="Selecione..." value="" color="#999" />
            {produtosList.map((p) => {

              const val = p.preco ? p.preco : 0;
              const precoFormatado = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(val);

              return (
                <Picker.Item
                  key={p.id}
                  label={`${p.name} - ${precoFormatado}`}
                  value={p.id}
                />
              );
            })}
          </Picker>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Qtd</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantidade}
              onChangeText={setQuantidade}
              placeholder="0"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={precoUnitario}
              onChangeText={setPrecoUnitario}
              placeholder="0.00"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.buttonAdd} onPress={handleAddItem}>
          <Text style={styles.textButtonAdd}>+ Adicionar Item</Text>
        </TouchableOpacity>

        {itensVenda.map((item) => (
          <View key={item.tempId} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.nomeProduto}</Text>
              {/* Proteção contra valor nulo no Preço Unitário */}
              <Text style={{ color: "#666" }}>
                {item.quantidade} x R${" "}
                {(Number(item.precoUnitario) || 0).toFixed(2)}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>

              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 5,
                  color: "#007AFF",
                }}
              >
                R${" "}
                {(
                  (Number(item.quantidade) || 0) *
                  (Number(item.precoUnitario) || 0)
                ).toFixed(2)}
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveItem(item.tempId)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.separator} />

        <TouchableOpacity style={styles.buttonSave} onPress={handleUpdate}>
          <Text style={styles.textButtonSave}>SALVAR ALTERAÇÕES</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginVertical: 10,
  },
  label: {
    width: "90%",
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
    alignSelf: "center",
  },
  pickerContainer: {
    width: "90%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: "center",
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  buttonAdd: {
    width: "90%",
    height: 45,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  textButtonAdd: { color: "#007AFF", fontWeight: "bold" },
  itemRow: {
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  deleteButton: {
    backgroundColor: "#ffecec",
    padding: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ff0000",
  },
  deleteText: { color: "#ff0000", fontSize: 10, fontWeight: "bold" },
  buttonSave: {
    width: "90%",
    height: 55,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
  },
  textButtonSave: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    width: "90%",
    alignSelf: "center",
    marginVertical: 20,
  },
});
