export class UserEntity {
  private id: string;
  private fullName: string;
  private email: string;
  private username: string;
  private password: string;
  private avatar: string;
  private dateOfBirth?: Date;
  private status: 'online' | 'offline';
  private point: number;
  private friends: string[];
  private createdAt: Date;
  private updatedAt: Date;
  private deletedAt?: Date;

  constructor() {}

  // Business logic methods
  addFriend(friendId: string): void {
    if (this.friends.includes(friendId)) {
      throw new Error('User is already a friend');
    }
    this.friends.push(friendId);
  }

  removeFriend(friendId: string): void {
    const index = this.friends.indexOf(friendId);
    if (index === -1) {
      throw new Error('Friend not found');
    }
    this.friends.splice(index, 1);
  }

  updateStatus(newStatus: 'online' | 'offline'): void {
    if (this.status === newStatus) {
      throw new Error(`User is already ${newStatus}`);
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  addPoints(points: number): void {
    if (points < 0) {
      throw new Error('Points cannot be negative');
    }
    this.point += points;
    this.updatedAt = new Date();
  }

  updateProfile(data: {
    fullName?: string;
    email?: string;
    avatar?: string;
    dateOfBirth?: Date;
  }): void {
    if (data.fullName) {
      if (!data.fullName.trim()) throw new Error('Full name cannot be empty');
      this.fullName = data.fullName;
    }
    if (data.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        throw new Error('Invalid email format');
      this.email = data.email;
    }
    if (data.avatar) {
      this.avatar = data.avatar;
    }
    if (data.dateOfBirth) {
      this.dateOfBirth = data.dateOfBirth;
    }
    this.updatedAt = new Date();
  }

  changePassword(newPassword: string): void {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    if (this.deletedAt) {
      throw new Error('User is already deleted');
    }
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getFullName(): string {
    return this.fullName;
  }
  getEmail(): string {
    return this.email;
  }
  getUsername(): string {
    return this.username;
  }
  getPassword(): string {
    return this.password;
  }
  getAvatar(): string {
    return this.avatar;
  }
  getDateOfBirth(): Date | undefined {
    return this.dateOfBirth;
  }
  getStatus(): 'online' | 'offline' {
    return this.status;
  }
  getPoint(): number {
    return this.point;
  }
  getFriends(): string[] {
    return this.friends;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
  getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  // Setters
  setId(id: string): void {
    if (!id.trim()) throw new Error('ID cannot be empty');
    this.id = id;
  }

  setFullName(fullName: string): void {
    if (!fullName.trim()) throw new Error('Full name cannot be empty');
    this.fullName = fullName;
  }

  setEmail(email: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
    this.email = email;
  }

  setUsername(username: string): void {
    if (!username.trim()) throw new Error('Username cannot be empty');
    this.username = username;
  }

  setPassword(password: string): void {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    this.password = password;
  }

  setAvatar(avatar: string): void {
    this.avatar = avatar;
  }

  setDateOfBirth(dateOfBirth: Date): void {
    this.dateOfBirth = dateOfBirth;
  }

  setStatus(status: 'online' | 'offline'): void {
    this.status = status;
  }

  setPoint(point: number): void {
    this.point = point;
  }

  setFriends(friends: string[]): void {
    this.friends = friends;
  }

  setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  setDeletedAt(deletedAt: Date | undefined): void {
    this.deletedAt = deletedAt;
  }
}
