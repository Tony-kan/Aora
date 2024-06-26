import {
	Client,
	Account,
	ID,
	Avatars,
	Databases,
	Query,
	Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
	endpoint: "https://cloud.appwrite.io/v1",
	platform: "com.tony.aora",
	projectId: "6622e3ce6579af25815e",
	databaseId: "6622e59c0c4eb08be9b6",
	userCollectionId: "6622e60ce953924ab631",
	videoCollectionId: "6622e63b0e9f6406f73c",
	storageId: "6622e9d5424c4e258dcc",
};

const {
	endpoint,
	platform,
	projectId,
	databaseId,
	userCollectionId,
	videoCollectionId,
	storageId,
} = appwriteConfig;

// Init your react-native SDK
const client = new Client();

client
	.setEndpoint(endpoint) // Your Appwrite Endpoint
	.setProject(projectId) // Your project ID
	.setPlatform(platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register User
export const createUser = async (email, password, username) => {
	try {
		const newAccount = await account.create(
			ID.unique(),
			email,
			password,
			username,
		);

		if (!newAccount) throw Error;

		const avatarUrl = avatars.getInitials(username);

		await signIn(email, password);

		const newUser = await databases.createDocument(
			databaseId,
			userCollectionId,
			ID.unique(),
			{
				accountId: newAccount.$id,
				email,
				username,
				avatar: avatarUrl,
			},
		);

		return newUser;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

//Login User
export const signIn = async (email, password) => {
	try {
		const session = await account.createEmailSession(email, password);

		return session;
	} catch (error) {
		console.log(error);
		throw new Error(error);
	}
};

//get Current User
export const getCurrentUser = async () => {
	try {
		const currentAccount = await account.get();

		if (!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(
			databaseId,
			userCollectionId,
			[Query.equal("accountId", currentAccount.$id)],
		);

		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		throw new Error(error);
	}
};

//get All posts
export const getAllPosts = async () => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [
			Query.orderDesc("$createdAt"),
		]);

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

//get Latest posts
export const getLatestPosts = async () => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [
			Query.orderDesc("$createdAt"),
			Query.limit(7),
		]);
		if (!posts) throw new Error("Something went wrong");

		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

//search posts
export const searchPosts = async (query) => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [
			Query.search("title", query),
		]);
		if (!posts) throw new Error("Something went wrong");
		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

//get User posts
export const getUserPosts = async (userId) => {
	try {
		const posts = await databases.listDocuments(databaseId, videoCollectionId, [
			Query.equal("creator", userId),
			Query.orderDesc("$createdAt"),
		]);
		if (!posts) throw new Error("Something went wrong");
		return posts.documents;
	} catch (error) {
		throw new Error(error);
	}
};

//signout
export const signOut = async () => {
	try {
		const session = await account.deleteSession("current");
		return session;
	} catch (error) {
		throw new Error(error);
	}
};

//file preview
export const getFilePreview = async (fieldId, type) => {
	let fileUrl;

	try {
		if (type === "video") {
			fileUrl = storage.getFileView(storageId, fieldId);
		} else if (type === "image") {
			fileUrl = storage.getFilePreview(
				storageId,
				fieldId,
				600,
				600,
				"top",
				100,
			);
		} else {
			throw new Error("Invalid file type");
		}
		if (!fileUrl) throw Error;
	} catch (error) {
		throw new Error(error);
	}
};

//upload file
export const uploadFile = async (file, type) => {
	if (!file) return;

	// const { mimeType, ...rest } = file;
	// const asset = { type: mimeType, ...rest };
	const asset = {
		name: file.fileName,
		type: file.mimeType,
		size: file.filesize,
		uri: file.uri,
	};
	console.log("File : ", file);
	console.log("Type : ", type);
	console.log("Asset : ", asset);

	try {
		const uploadFile = await storage.createFile(storageId, ID.unique(), asset);

		console.log("Uploaded : ", uploadFile);

		const fileUrl = await getFilePreview(uploadFile.$id, type);

		return fileUrl;
	} catch (error) {
		throw new Error(error);
	}
};
//create video
export const createVideo = async (form) => {
	try {
		const [thumbnailUrl, videoUrl] = await Promise.all([
			uploadFile(form.thumbnail, "image"),
			uploadFile(form.video, "video"),
		]);

		const newPost = await databases.createDocument(
			databaseId,
			videoCollectionId,
			ID.unique(),
			{
				title: form.title,
				thumbnail: form.thumbnail,
				video: form.video,
				prompt: form.prompt,
				creator: form.userId,
			},
		);

		return newPost;
	} catch (error) {
		throw new Error(error);
	}
};
