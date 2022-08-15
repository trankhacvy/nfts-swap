import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BaseTable, Listings, Offer } from "types/schema";

interface BaseRepository<T extends BaseTable> {
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<T[]>;
  find(key: keyof T, value: T[keyof T]): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  exist(id: string | Partial<T>): Promise<boolean>;
}

export class SupbaseRepository<T extends BaseTable>
  implements BaseRepository<T>
{
  supabase: SupabaseClient;

  constructor(public readonly tableName: string) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY as string
    );
  }

  async create(item: T): Promise<T> {
    const { data, error } = await this.supabase
      .from<T>(this.tableName)
      .insert(item as Partial<T>);
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Unknown Error");
    return data[0];
  }

  async update(id: string, item: Partial<T>): Promise<boolean> {
    const { data, error } = await this.supabase
      .from<T>(this.tableName)
      .update(item)
      .match({ id });

    return !!data && !error;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from<T>(this.tableName)
      .delete()
      .match({ id });
    return !error;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from<T>(this.tableName)
      .select("*")
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  }

  async find(key: keyof T, value: T[keyof T]): Promise<T[]> {
    const { data, error } = await this.supabase
      .from<T>(this.tableName)
      .select("*")
      .eq(key, value);
    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from<T>(this.tableName)
      .select("*")
      .eq("id", id as T["id"])
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }

  async exist(id: string | Partial<T>): Promise<boolean> {
    const { error } = await this.supabase
      .from<T>(this.tableName)
      .select("*")
      // @ts-ignore
      .eq("id", id)
      .limit(1)
      .single();
    console.log(error);
    if (error) return false;
    return true;
  }
}

export class ListingsRepository extends SupbaseRepository<Listings> {
  constructor() {
    super("listings");
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from<Listings>(this.tableName)
      .select("*, offers (*)")
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  }

  async findByMint(mint: string): Promise<Listings | null> {
    const { data, error } = await this.supabase
      .from<Listings>(this.tableName)
      .select("*, offers (*)")
      .eq("mint", mint)
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }
}

export class OffersRepository extends SupbaseRepository<Offer> {
  constructor() {
    super("offers");
  }
}
