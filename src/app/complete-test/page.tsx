"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export default function FullCRUDTestPage() {
  // 編集モード状態
  const [editingUser, setEditingUser] = useState<{id: number, username: string} | null>(null);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);

  // フォーム状態
  const [newUsername, setNewUsername] = useState("");
  const [newLocation, setNewLocation] = useState({
    name: "",
    latitude: 35.6812,
    longitude: 139.7671,
    address: "",
    description: "",
    created_by: 1,
  });
  const [newVisit, setNewVisit] = useState({
    location_id: 1,
    visit_date: new Date(),
    notes: "",
    rating: 5,
    created_by: 1,
  });
  const [newPhoto, setNewPhoto] = useState({
    visit_id: 1,
    file_path: "",
    description: "",
    created_by: 1,
  });

  // データ取得
  const { data: users, refetch: refetchUsers } = api.users.getAll.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: locations, refetch: refetchLocations } = api.locations.getAll.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: visits, refetch: refetchVisits } = api.visits.getAll.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: visitPhotos, refetch: refetchPhotos } = api.visitPhotos.getAll.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Create Mutations
  const createUser = api.users.create.useMutation({
    onSuccess: () => {
      setNewUsername("");
      refetchUsers();
    },
  });

  const createLocation = api.locations.create.useMutation({
    onSuccess: () => {
      setNewLocation({
        name: "",
        latitude: 35.6812,
        longitude: 139.7671,
        address: "",
        description: "",
        created_by: 1,
      });
      refetchLocations();
    },
  });

  const createVisit = api.visits.create.useMutation({
    onSuccess: () => {
      setNewVisit({
        location_id: 1,
        visit_date: new Date(),
        notes: "",
        rating: 5,
        created_by: 1,
      });
      refetchVisits();
    },
  });

  const createPhoto = api.visitPhotos.create.useMutation({
    onSuccess: () => {
      setNewPhoto({
        visit_id: 1,
        file_path: "",
        description: "",
        created_by: 1,
      });
      refetchPhotos();
    },
  });

  // Update Mutations
  const updateUser = api.users.update.useMutation({
    onSuccess: () => {
      setEditingUser(null);
      refetchUsers();
    },
  });

  const updateLocation = api.locations.update.useMutation({
    onSuccess: () => {
      setEditingLocation(null);
      refetchLocations();
    },
  });

  const updateVisit = api.visits.update.useMutation({
    onSuccess: () => {
      setEditingVisit(null);
      refetchVisits();
    },
  });

  const updatePhoto = api.visitPhotos.update.useMutation({
    onSuccess: () => {
      setEditingPhoto(null);
      refetchPhotos();
    },
  });

  // Delete Mutations
  const deleteUser = api.users.delete.useMutation({
    onSuccess: () => refetchUsers(),
  });

  const deleteLocation = api.locations.delete.useMutation({
    onSuccess: () => refetchLocations(),
  });

  const deleteVisit = api.visits.delete.useMutation({
    onSuccess: () => refetchVisits(),
  });

  const deletePhoto = api.visitPhotos.delete.useMutation({
    onSuccess: () => refetchPhotos(),
  });

  // ハンドラー関数
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      try {
        await createUser.mutateAsync({ username: newUsername.trim() });
        alert("ユーザーが作成されました！");
      } catch (error) {
        console.error("Error creating user:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && editingUser.username.trim()) {
      try {
        await updateUser.mutateAsync({
          id: editingUser.id,
          username: editingUser.username.trim(),
        });
        alert("ユーザーが更新されました！");
      } catch (error) {
        console.error("Error updating user:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (confirm(`ユーザー「${username}」を削除しますか？`)) {
      try {
        await deleteUser.mutateAsync({ id });
        alert("ユーザーが削除されました！");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("エラーが発生しました（関連データがある可能性があります）");
      }
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation.name.trim()) {
      try {
        await createLocation.mutateAsync(newLocation);
        alert("場所が作成されました！");
      } catch (error) {
        console.error("Error creating location:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation && editingLocation.name.trim()) {
      try {
        const updateData = {
          id: editingLocation.location_id,
          name: editingLocation.name,
          latitude: Number(editingLocation.latitude),
          longitude: Number(editingLocation.longitude),
          address: editingLocation.address || "",
          description: editingLocation.description || "",
          updated_by: Number(editingLocation.updated_by),
        };
        
        await updateLocation.mutateAsync(updateData);
        alert("場所が更新されました！");
      } catch (error) {
        console.error("Error updating location:", error);
        alert("エラーが発生しました: " + (error as any)?.message);
      }
    }
  };

  const handleDeleteLocation = async (id: number, name: string) => {
    if (confirm(`場所「${name}」を削除しますか？`)) {
      try {
        await deleteLocation.mutateAsync({ id });
        alert("場所が削除されました！");
      } catch (error) {
        console.error("Error deleting location:", error);
        alert("エラーが発生しました（関連する訪問記録がある可能性があります）");
      }
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVisit.mutateAsync(newVisit);
      alert("訪問記録が作成されました！");
    } catch (error) {
      console.error("Error creating visit:", error);
      alert("エラーが発生しました");
    }
  };

  const handleUpdateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVisit) {
      try {
        await updateVisit.mutateAsync({
          id: editingVisit.visit_id,
          visit_date: editingVisit.visit_date,
          notes: editingVisit.notes,
          rating: editingVisit.rating,
          updated_by: editingVisit.updated_by,
        });
        alert("訪問記録が更新されました！");
      } catch (error) {
        console.error("Error updating visit:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleDeleteVisit = async (id: number, locationName: string) => {
    if (confirm(`「${locationName}」の訪問記録を削除しますか？`)) {
      try {
        await deleteVisit.mutateAsync({ id });
        alert("訪問記録が削除されました！");
      } catch (error) {
        console.error("Error deleting visit:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhoto.file_path.trim()) {
      try {
        await createPhoto.mutateAsync(newPhoto);
        alert("写真が作成されました！");
      } catch (error) {
        console.error("Error creating photo:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPhoto && editingPhoto.file_path.trim()) {
      try {
        await updatePhoto.mutateAsync({
          id: editingPhoto.photo_id,
          file_path: editingPhoto.file_path,
          description: editingPhoto.description,
          updated_by: editingPhoto.updated_by,
        });
        alert("写真が更新されました！");
      } catch (error) {
        console.error("Error updating photo:", error);
        alert("エラーが発生しました");
      }
    }
  };

  const handleDeletePhoto = async (id: number, filePath: string) => {
    if (confirm(`写真「${filePath}」を削除しますか？`)) {
      try {
        await deletePhoto.mutateAsync({ id });
        alert("写真が削除されました！");
      } catch (error) {
        console.error("Error deleting photo:", error);
        alert("エラーが発生しました");
      }
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">完全CRUD操作テスト（全テーブル対応）</h1>
      
      {/* 統計情報 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-semibold">ユーザー</h3>
          <p className="text-2xl">{users?.length || 0}</p>
        </div>
        <div className="p-4 bg-green-100 rounded">
          <h3 className="font-semibold">場所</h3>
          <p className="text-2xl">{locations?.length || 0}</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded">
          <h3 className="font-semibold">訪問記録</h3>
          <p className="text-2xl">{visits?.length || 0}</p>
        </div>
        <div className="p-4 bg-purple-100 rounded">
          <h3 className="font-semibold">写真</h3>
          <p className="text-2xl">{visitPhotos?.length || 0}</p>
        </div>
      </div>

      {/* ユーザー管理 */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">👤 ユーザー管理</h2>
        
        {/* ユーザー作成フォーム */}
        <form onSubmit={handleCreateUser} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="新しいユーザー名"
            className="border px-3 py-2 rounded flex-1"
          />
          <button
            type="submit"
            disabled={createUser.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {createUser.isPending ? "作成中..." : "ユーザー作成"}
          </button>
        </form>

        {/* ユーザー編集フォーム */}
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="flex gap-4 mb-6 p-4 bg-yellow-50 rounded">
            <input
              type="text"
              value={editingUser.username}
              onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              type="submit"
              disabled={updateUser.isPending}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {updateUser.isPending ? "更新中..." : "更新"}
            </button>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              キャンセル
            </button>
          </form>
        )}

        {/* ユーザー一覧 */}
        <div className="space-y-2">
          {users?.map((user) => (
            <div key={user.user_id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <p><strong>ID:</strong> {user.user_id}</p>
                <p><strong>ユーザー名:</strong> {user.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingUser({id: user.user_id, username: user.username})}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteUser(user.user_id, user.username)}
                  disabled={deleteUser.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 場所管理 */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">📍 場所管理</h2>
        
        {/* 場所作成フォーム */}
        <form onSubmit={handleCreateLocation} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              placeholder="場所名"
              className="border px-3 py-2 rounded"
              required
            />
            <input
              type="text"
              value={newLocation.address}
              onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
              placeholder="住所"
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.000001"
              value={newLocation.latitude}
              onChange={(e) => setNewLocation({...newLocation, latitude: parseFloat(e.target.value) || 0})}
              placeholder="緯度"
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              step="0.000001"
              value={newLocation.longitude}
              onChange={(e) => setNewLocation({...newLocation, longitude: parseFloat(e.target.value) || 0})}
              placeholder="経度"
              className="border px-3 py-2 rounded"
            />
          </div>
          <textarea
            value={newLocation.description}
            onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
            placeholder="説明"
            className="border px-3 py-2 rounded w-full"
            rows={2}
          />
          <select
            value={newLocation.created_by}
            onChange={(e) => setNewLocation({...newLocation, created_by: parseInt(e.target.value)})}
            className="border px-3 py-2 rounded"
          >
            {users?.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.username}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={createLocation.isPending}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {createLocation.isPending ? "作成中..." : "場所作成"}
          </button>
        </form>

        {/* 場所編集フォーム */}
        {editingLocation && (
          <form onSubmit={handleUpdateLocation} className="space-y-4 mb-6 p-4 bg-yellow-50 rounded">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={editingLocation.name}
                onChange={(e) => setEditingLocation({...editingLocation, name: e.target.value})}
                className="border px-3 py-2 rounded"
                required
              />
              <input
                type="text"
                value={editingLocation.address}
                onChange={(e) => setEditingLocation({...editingLocation, address: e.target.value})}
                className="border px-3 py-2 rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="0.000001"
                value={editingLocation.latitude}
                onChange={(e) => setEditingLocation({...editingLocation, latitude: parseFloat(e.target.value) || 0})}
                className="border px-3 py-2 rounded"
              />
              <input
                type="number"
                step="0.000001"
                value={editingLocation.longitude}
                onChange={(e) => setEditingLocation({...editingLocation, longitude: parseFloat(e.target.value) || 0})}
                className="border px-3 py-2 rounded"
              />
            </div>
            <textarea
              value={editingLocation.description}
              onChange={(e) => setEditingLocation({...editingLocation, description: e.target.value})}
              className="border px-3 py-2 rounded w-full"
              rows={2}
            />
            <select
              value={editingLocation.updated_by}
              onChange={(e) => setEditingLocation({...editingLocation, updated_by: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              {users?.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updateLocation.isPending}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {updateLocation.isPending ? "更新中..." : "更新"}
              </button>
              <button
                type="button"
                onClick={() => setEditingLocation(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* 場所一覧 */}
        <div className="space-y-2">
          {locations?.map((location) => (
            <div key={location.location_id} className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p><strong>場所名:</strong> {location.name}</p>
                  <p><strong>住所:</strong> {location.address}</p>
                  <p><strong>座標:</strong> {location.latitude.toString()}, {location.longitude.toString()}</p>
                  <p><strong>説明:</strong> {location.description}</p>
                  <p><strong>作成者:</strong> {location.users_locations_created_byTousers?.username || "不明"}</p>
                  <p><strong>訪問回数:</strong> {location._count?.visits || 0}回</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingLocation({
                      ...location,
                      updated_by: 1
                    })}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(location.location_id, location.name)}
                    disabled={deleteLocation.isPending}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 訪問記録管理 */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">🗓️ 訪問記録管理</h2>
        
        {/* 訪問記録作成フォーム */}
        <form onSubmit={handleCreateVisit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newVisit.location_id}
              onChange={(e) => setNewVisit({...newVisit, location_id: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              {locations?.map((location) => (
                <option key={location.location_id} value={location.location_id}>
                  {location.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={newVisit.visit_date.toISOString().slice(0, 16)}
              onChange={(e) => setNewVisit({...newVisit, visit_date: new Date(e.target.value)})}
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newVisit.rating}
              onChange={(e) => setNewVisit({...newVisit, rating: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              <option value={1}>★☆☆☆☆ (1)</option>
              <option value={2}>★★☆☆☆ (2)</option>
              <option value={3}>★★★☆☆ (3)</option>
              <option value={4}>★★★★☆ (4)</option>
              <option value={5}>★★★★★ (5)</option>
            </select>
            <select
              value={newVisit.created_by}
              onChange={(e) => setNewVisit({...newVisit, created_by: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              {users?.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={newVisit.notes}
            onChange={(e) => setNewVisit({...newVisit, notes: e.target.value})}
            placeholder="訪問メモ"
            className="border px-3 py-2 rounded w-full"
            rows={2}
          />
          <button
            type="submit"
            disabled={createVisit.isPending || !locations?.length}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {createVisit.isPending ? "作成中..." : "訪問記録作成"}
          </button>
        </form>

        {/* 訪問記録編集フォーム */}
        {editingVisit && (
          <form onSubmit={handleUpdateVisit} className="space-y-4 mb-6 p-4 bg-yellow-50 rounded">
            <input
              type="datetime-local"
              value={new Date(editingVisit.visit_date).toISOString().slice(0, 16)}
              onChange={(e) => setEditingVisit({...editingVisit, visit_date: new Date(e.target.value)})}
              className="border px-3 py-2 rounded w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={editingVisit.rating}
                onChange={(e) => setEditingVisit({...editingVisit, rating: parseInt(e.target.value)})}
                className="border px-3 py-2 rounded"
              >
                <option value={1}>★☆☆☆☆ (1)</option>
                <option value={2}>★★☆☆☆ (2)</option>
                <option value={3}>★★★☆☆ (3)</option>
                <option value={4}>★★★★☆ (4)</option>
                <option value={5}>★★★★★ (5)</option>
              </select>
              <select
                value={editingVisit.updated_by}
                onChange={(e) => setEditingVisit({...editingVisit, updated_by: parseInt(e.target.value)})}
                className="border px-3 py-2 rounded"
              >
                {users?.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={editingVisit.notes}
              onChange={(e) => setEditingVisit({...editingVisit, notes: e.target.value})}
              className="border px-3 py-2 rounded w-full"
              rows={2}
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updateVisit.isPending}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {updateVisit.isPending ? "更新中..." : "更新"}
              </button>
              <button
                type="button"
                onClick={() => setEditingVisit(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* 訪問記録一覧 */}
        <div className="space-y-2">
          {visits?.map((visit) => (
            <div key={visit.visit_id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <p><strong>場所:</strong> {visit.locations.name}</p>
                <p><strong>訪問日:</strong> {new Date(visit.visit_date).toLocaleDateString()}</p>
                <p><strong>評価:</strong> {"★".repeat(visit.rating)}({visit.rating}/5)</p>
                <p><strong>メモ:</strong> {visit.notes}</p>
                <p><strong>訪問者:</strong> {visit.users_visits_created_byTousers.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingVisit({
                    ...visit,
                    updated_by: 1
                  })}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteVisit(visit.visit_id, visit.locations.name)}
                  disabled={deleteVisit.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 写真管理 */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">📷 写真管理</h2>
        
        {/* 写真作成フォーム */}
        <form onSubmit={handleCreatePhoto} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newPhoto.visit_id}
              onChange={(e) => setNewPhoto({...newPhoto, visit_id: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              {visits?.map((visit) => (
                <option key={visit.visit_id} value={visit.visit_id}>
                  {visit.locations.name} - {new Date(visit.visit_date).toLocaleDateString()}
                </option>
              ))}
            </select>
            <select
              value={newPhoto.created_by}
              onChange={(e) => setNewPhoto({...newPhoto, created_by: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              {users?.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={newPhoto.file_path}
            onChange={(e) => setNewPhoto({...newPhoto, file_path: e.target.value})}
            placeholder="ファイルパス（例: /uploads/photo1.jpg）"
            className="border px-3 py-2 rounded w-full"
            required
          />
          <textarea
            value={newPhoto.description}
            onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
            placeholder="写真の説明"
            className="border px-3 py-2 rounded w-full"
            rows={2}
          />
          <button
            type="submit"
            disabled={createPhoto.isPending || !visits?.length}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {createPhoto.isPending ? "作成中..." : "写真作成"}
          </button>
        </form>

        {/* 写真編集フォーム */}
        {editingPhoto && (
          <form onSubmit={handleUpdatePhoto} className="space-y-4 mb-6 p-4 bg-yellow-50 rounded">
            <input
              type="text"
              value={editingPhoto.file_path}
              onChange={(e) => setEditingPhoto({...editingPhoto, file_path: e.target.value})}
              className="border px-3 py-2 rounded w-full"
              required
            />
            <textarea
              value={editingPhoto.description}
              onChange={(e) => setEditingPhoto({...editingPhoto, description: e.target.value})}
              className="border px-3 py-2 rounded w-full"
              rows={2}
            />
            <select
              value={editingPhoto.updated_by}
              onChange={(e) => setEditingPhoto({...editingPhoto, updated_by: parseInt(e.target.value)})}
              className="border px-3 py-2 rounded"
            >
              {users?.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updatePhoto.isPending}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
              >
                {updatePhoto.isPending ? "更新中..." : "更新"}
              </button>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}

        {/* 写真一覧 */}
        <div className="space-y-2">
          {visitPhotos?.map((photo) => (
            <div key={photo.photo_id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <p><strong>ファイル:</strong> {photo.file_path}</p>
                <p><strong>説明:</strong> {photo.description}</p>
                <p><strong>場所:</strong> {photo.visits.locations.name}</p>
                <p><strong>撮影者:</strong> {photo.users_visit_photos_created_byTousers.username}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPhoto({
                    ...photo,
                    updated_by: 1
                  })}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.photo_id, photo.file_path)}
                  disabled={deletePhoto.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CRUD操作確認 */}
      <div className="p-4 bg-green-100 rounded">
        <h3 className="font-semibold text-green-800">🎉 全テーブル完全CRUD操作対応</h3>
        <div className="mt-2 grid grid-cols-4 gap-4 text-green-700 text-sm">
          <div>
            <p className="font-semibold">👤 ユーザー</p>
            <p>✅ 作成・読み取り・編集・削除</p>
          </div>
          <div>
            <p className="font-semibold">📍 場所</p>
            <p>✅ 作成・読み取り・編集・削除</p>
          </div>
          <div>
            <p className="font-semibold">🗓️ 訪問記録</p>
            <p>✅ 作成・読み取り・編集・削除</p>
          </div>
          <div>
            <p className="font-semibold">📷 写真</p>
            <p>✅ 作成・読み取り・編集・削除</p>
          </div>
        </div>
      </div>
    </div>
  );
}